import type { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { createDirtyChecker } from './experimental/utils';
import { optimize } from './experimental/optimize';
import type { Info } from './babel.new';
import { NO_PX_PROPERTIES, SKIP_ANNOTATION, SVG_ELEMENTS } from './constants';
import { findChild, findChildMultiple, findComment } from './utils/ast';
import { evaluate } from './utils/evaluate';
import { getUniqueId } from './utils/id';
import {
  handleTopLevelFragment,
  isAttributeUnsupported,
  isComponent,
  isJSXFragment,
  isSensitiveJSXElement,
  isStaticAttributeValue,
  trimJSXChildren,
} from './utils/jsx';
import { deopt, warn } from './utils/log';
import { addImport, isUseClient } from './utils/mod';
import { dedupeObjectProperties } from './utils/object';

export type HoistedMap = Record<
  string,
  {
    id: t.Identifier;
    value: t.Expression | null;
  }
>;

export const transformBlock = (
  callExpressionPath: NodePath<t.CallExpression>,
  info: Info,
  unstable = false
): void => {
  if (!info.imports.source) return;

  const callExpression = callExpressionPath.node;

  if (
    // skip annotation indicates transformed block
    findComment(callExpression, SKIP_ANNOTATION) ||
    !t.isIdentifier(callExpression.callee) ||
    // alias check (e.g. import { block as b } from 'million/react')
    !info.imports.aliases.block?.has(callExpression.callee.name) ||
    !info.imports.block
  ) {
    return;
  }

  const rawComponent = callExpression.arguments[0];
  const publicComponent =
    t.isVariableDeclarator(callExpressionPath.parent) &&
    t.isIdentifier(callExpressionPath.parent.id)
      ? callExpressionPath.parent.id
      : null;

  if (
    !t.isIdentifier(rawComponent) &&
    !t.isFunctionDeclaration(rawComponent) &&
    !t.isFunctionExpression(rawComponent) &&
    !t.isArrowFunctionExpression(rawComponent)
  ) {
    throw deopt(
      'Unsupported argument for block. Make sure blocks consume a component ' +
        'function or component reference',
      info.filename,
      callExpressionPath
    );
  }

  if (t.isIdentifier(rawComponent) && info.blocks.has(rawComponent.name)) {
    callExpressionPath.replaceWith(rawComponent);
    return;
  }

  /**
   * Replaces `export default block(Component)` with
   * const default$ = block(Component);
   * export default default$;
   */
  const exportDefaultPath = callExpressionPath.parentPath;
  if (exportDefaultPath.isExportDefaultDeclaration()) {
    let name: string;
    if (t.isIdentifier(rawComponent)) {
      name = rawComponent.name;
    } else if (
      t.isFunctionExpression(rawComponent) &&
      t.isIdentifier(rawComponent.id)
    ) {
      name = rawComponent.id.name;
    } else {
      name = 'default$';
    }

    const exportId = getUniqueId(info.programPath, name);
    const paths = exportDefaultPath.insertBefore(
      t.variableDeclaration('let', [
        t.variableDeclarator(exportId, callExpression),
      ])
    );
    exportDefaultPath.replaceWith(t.exportDefaultDeclaration(exportId));

    callExpressionPath.scope.registerDeclaration(paths[0]);
    callExpressionPath.scope.registerDeclaration(exportDefaultPath);

    // this "creates" a new callExpressionPath, so it will be picked up again on the
    // next visitor call. no need to continue.
    return;
  }

  /**
   * Normally, we assume the Component to be a identifier (e.g. block(Component)) that
   * references a function. However, it's possible that the user passes an anonymous
   * function (e.g. block(() => <div />)). In this case, we need to hoist the function
   * declaration to the top of the scope and replace the anonymous function with the
   * identifier of the hoisted function.
   *
   * ```js
   * block(() => <div />)
   *
   * // becomes
   *
   * const anonymous = () => <div />;
   *
   * block(anonymous)
   * ```
   */

  if (
    t.isFunctionExpression(rawComponent) ||
    t.isArrowFunctionExpression(rawComponent)
  ) {
    const name =
      t.isFunctionExpression(rawComponent) && t.isIdentifier(rawComponent.id)
        ? rawComponent.id.name
        : publicComponent?.name || 'Anonymous';
    const anonymousComponentId = getUniqueId(callExpressionPath, name);

    /**
     * Replaces function expression with identifier
     * `block(() => ...)` to `block(anonymous)`
     */

    // TODO: check this
    const paths = callExpressionPath.parentPath.parentPath?.insertBefore(
      t.variableDeclaration('let', [
        t.variableDeclarator(anonymousComponentId, rawComponent),
      ])
    );

    if (paths) {
      callExpressionPath.scope.registerDeclaration(paths[0]);
    }

    callExpressionPath.replaceWith(
      t.callExpression(callExpression.callee, [anonymousComponentId])
    );

    // this "creates" a new callExpressionPath, so it will be picked up again on the
    // next visitor call. no need to continue.
    return;
  }

  const componentDeclarationPath = callExpressionPath.scope.getBinding(
    rawComponent.name
  )!.path as NodePath<t.VariableDeclarator | t.FunctionDeclaration>;

  // handles forwardRef
  if (componentDeclarationPath.isVariableDeclarator()) {
    const initPath = componentDeclarationPath.get(
      'init'
    ) as NodePath<t.CallExpression>;
    const init = initPath.node;

    if (
      t.isCallExpression(init) &&
      findChild(
        initPath,
        'Identifier',
        (p) => p.isIdentifier() && p.node.name === 'forwardRef'
      )
    ) {
      const forwardRefComponent = init.arguments[0];
      const isId = t.isIdentifier(forwardRefComponent);
      const isFunction = t.isFunctionExpression(forwardRefComponent);
      const isArrowFunction = t.isArrowFunctionExpression(forwardRefComponent);
      if (isId || isFunction || isArrowFunction) {
        let name = publicComponent?.name || 'Anonymous';
        if (isId) {
          name = forwardRefComponent.name;
        } else if (isFunction && t.isIdentifier(forwardRefComponent.id)) {
          name = forwardRefComponent.id.name;
        }

        const anonymousComponentId = getUniqueId(info.programPath, name);
        componentDeclarationPath.replaceWithMultiple([
          t.variableDeclaration('let', [
            t.variableDeclarator(
              anonymousComponentId,
              t.callExpression(callExpression.callee, [forwardRefComponent])
            ),
          ]),
          t.variableDeclaration('let', [
            t.variableDeclarator(
              componentDeclarationPath.node.id,
              anonymousComponentId
            ),
          ]),
        ]);

        // TODO: check this
        const { parent } = callExpressionPath;
        if (
          t.isVariableDeclarator(parent) &&
          'arguments' in callExpression &&
          t.isIdentifier(callExpression.arguments[0])
        ) {
          callExpressionPath.parentPath.replaceWith(
            t.variableDeclarator(callExpression.arguments[0])
          );
        }

        // this "creates" a new callExpressionPath, so it will be picked up again on the
        // next visitor call. no need to continue.
        return;
      }
    }
  }

  const componentDeclaration = componentDeclarationPath.node;
  const componentName =
    rawComponent.name ||
    (t.isIdentifier(componentDeclaration.id)
      ? componentDeclaration.id.name
      : null);

  const isVariableDeclarator =
    t.isVariableDeclarator(componentDeclaration) &&
    (t.isArrowFunctionExpression(componentDeclaration.init) ||
      t.isFunctionExpression(componentDeclaration.init));
  const isFunctionDeclaration = t.isFunctionDeclaration(componentDeclaration);

  /**
   * If the function body directly returns a JSX element (i.e., not wrapped in a BlockStatement),
   * we transform the JSX return into a BlockStatement before passing it to `transformComponent()`.
   *
   * ```jsx
   * const Component = () => <div></div>
   *
   * // becomes
   * const Component = () => {
   *   return <div></div>
   * }
   * ```
   */
  if (isVariableDeclarator) {
    const bodyPath = componentDeclarationPath.get('init.body') as NodePath;
    if (!bodyPath.isBlockStatement() && bodyPath.isExpression()) {
      bodyPath.replaceWith(
        t.blockStatement([t.returnStatement(bodyPath.node)])
      );
    }
  }

  if (t.isImportSpecifier(componentDeclaration)) {
    throw deopt(
      'You are using a component imported from another file. The component ' +
        'must be colocated in the same file as the block.',
      info.filename,
      componentDeclarationPath
    );
  } else if (!isVariableDeclarator && !isFunctionDeclaration) {
    throw deopt(
      'You can only use block() with a function declaration or arrow function.',
      info.filename,
      callExpressionPath
    );
  }

  const componentBodyPath = (
    isVariableDeclarator
      ? componentDeclarationPath.get('init.body')
      : componentDeclarationPath.get('body')
  ) as NodePath<t.BlockStatement>;

  /**
   * We can extract the block statement from the component function body
   * by accessing the `body` property of the function declaration / variable declarator:
   *
   * ```js
   *
   * function Component() {
   *                     ^ componentBody
   *  return <div />;
   *  ^ componentBody.body => [returnStatement]
   * }
   */
  if (!componentBodyPath.isBlockStatement()) {
    throw deopt(
      'Expected a block statement function() { /* block */ } in your function ' +
        'body. Make sure you are using a function declaration or arrow function.',
      info.filename,
      callExpressionPath
    );
  }

  /**
   * We need to make sure that the component function doesn't contain early returns.
   * This is because we need to be able to extract the JSX from the component function body.
   * If there are multiple return statements, we can't be sure which one is the correct one.
   *
   * ```js
   * function Component() {
   *  if (condition) {
   *    return <div />; <-- this is an illegal early return
   *  }
   *  return <span />;
   * }
   */
  const statementsInBody = componentBodyPath.get('body').length;

  const returnStatementPaths = findChildMultiple<t.ReturnStatement>(
    componentBodyPath,
    'ReturnStatement'
  );

  if (!returnStatementPaths.length) {
    throw deopt(
      'Expected a return statement in your component',
      info.filename,
      componentBodyPath
    );
  }

  if (returnStatementPaths.length > 1) {
    throw deopt(
      'Expected only one return statement in your component',
      info.filename,
      componentBodyPath
    );
  }

  const returnStatementPath = returnStatementPaths[0]!;
  const returnStatement = returnStatementPath.node;

  if (isJSXFragment(returnStatement.argument)) {
    handleTopLevelFragment(returnStatement);
  }

  const hoistedMap: HoistedMap = {};
  const mutations: (() => void)[] = [];
  const portal = {
    index: -1,
    id: getUniqueId(componentBodyPath, 'portal'),
  };

  if (!t.isJSXElement(returnStatement.argument)) {
    throw deopt(null, info.filename, callExpressionPath);
  }

  /**
   * The compiler splits the original Component into two, in order to conform to the runtime API:
   *
   * A puppet component, which holds a stateless and deterministic f(props) => JSX,
   * and creates the block from that function:

   * ```js
   * const puppet = block(({ foo }) => {
   *  return ...
   * })
   * ```
   *
   * A master component, which holds the data / state and passes it down to
   * the block:
   *
   * ```js
   * const master = (props) => {
   *  const [foo, setFoo] = useState(0);
   *  return puppet({
   *    foo,
   *    bar: props.bar
   *  })
   * }
   * ```
   */
  let masterComponentId = componentName
    ? t.identifier(componentName)
    : getUniqueId(callExpressionPath, 'Anonymous');
  const puppetComponentId = getUniqueId(
    callExpressionPath,
    `Block_${componentName || ''}`
  );

  const layers: t.JSXElement[] = extractLayers({
    returnStatement,
    jsx: returnStatement.argument,
    jsxPath: returnStatementPath.get('argument') as NodePath<t.JSXElement>,
    layers: [],
  });
  // This function will automatically populate the `dynamics` for us:

  if (
    t.isJSXIdentifier(returnStatement.argument.openingElement.name) &&
    isComponent(returnStatement.argument.openingElement.name.name)
  ) {
    throw deopt(null, info.filename, callExpressionPath);
  }
  transformJSX(
    hoistedMap,
    mutations,
    portal,
    info,
    {
      jsx: returnStatement.argument,
      jsxPath: returnStatementPath.get('argument') as NodePath<t.JSXElement>,
      componentBodyPath,
      isRoot: true,
    },
    unstable
  );

  const hoisted = Object.values(hoistedMap);
  if (!hoisted.length && info.options.server) {
    throw deopt(null, info.filename, callExpressionPath);
  }

  const isCallable =
    statementsInBody === 1 && layers.length === 0 && portal.index === -1;

  /**
   * ```js
   * const puppet = block(({ foo }) => {
   *  return ...
   * }, { shouldUpdate: (oldProps, newProps) => oldProps.foo !== newProps.foo })
   * ```
   */

  const len = hoisted.length;
  const holes = new Array(len);
  const objectProperties = new Array(len);
  const puppetJsxAttributes = new Array(len);
  const data: { id: t.Identifier; value: t.Expression | null }[] = [];
  for (let i = 0; i < len; ++i) {
    const { id, value } = hoisted[i]!;
    holes[i] = id.name;
    objectProperties[i] = t.objectProperty(id, id, false, true);
    puppetJsxAttributes[i] = t.jsxAttribute(
      t.jsxIdentifier(id.name),
      t.jsxExpressionContainer(id)
    );
    if (!value) continue;
    data.push({ id, value });
  }

  const originalObjectExpression = callExpression.arguments[1] as
    | t.ObjectExpression
    | undefined;

  const originalOptions: Record<string, any> = {};

  if (originalObjectExpression) {
    for (
      let i = 0, j = originalObjectExpression.properties.length;
      i < j;
      ++i
    ) {
      const prop = originalObjectExpression.properties[i]!;
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        originalOptions[prop.key.name] = prop.value;
      }
    }
  }

  const compiledOptions: t.ObjectProperty[] = [];

  const argument = returnStatement.argument;
  if (
    t.isJSXElement(argument) &&
    t.isJSXIdentifier(argument.openingElement.name) &&
    SVG_ELEMENTS.includes(argument.openingElement.name.name)
  ) {
    originalOptions.svg = true;
  }

  if (originalOptions.svg) {
    compiledOptions.push(
      t.objectProperty(
        t.identifier('svg'),
        t.booleanLiteral(originalOptions.svg)
      )
    );
  }

  if (info.options.server && isUseClient(info)) {
    compiledOptions.push(
      t.objectProperty(
        t.identifier('rsc'),
        t.booleanLiteral(true)
      )
    );
  }

  const shouldUpdate =
    originalOptions.shouldUpdate ?? createDirtyChecker(holes);
  if (shouldUpdate) {
    compiledOptions.push(
      t.objectProperty(t.identifier('shouldUpdate'), shouldUpdate)
    );
  }

  const puppetFn = t.arrowFunctionExpression(
    objectProperties.length ? [t.objectPattern(objectProperties)] : [],
    t.blockStatement([returnStatement])
  );

  const puppetBlock = t.callExpression(callExpression.callee, [
    puppetFn,
    compiledOptions.length
      ? t.objectExpression(dedupeObjectProperties(compiledOptions))
      : t.nullLiteral(),
  ]);

  t.addComment(puppetBlock, 'leading', SKIP_ANNOTATION);

  if (portal.index !== -1) {
    const useState = addImport(componentBodyPath, 'useState', 'react', info);
    data.unshift({
      id: portal.id,
      value: t.memberExpression(
        t.callExpression(useState, [
          t.arrowFunctionExpression(
            [],
            t.objectExpression([
              t.objectProperty(
                t.identifier('$'),
                t.newExpression(t.identifier('Array'), [
                  t.numericLiteral(portal.index + 1),
                ])
              ),
            ])
          ),
        ]),
        t.numericLiteral(0),
        true
      ),
    });
  }

  if (data.length) {
    returnStatementPath.insertBefore(
      t.variableDeclaration(
        'let',
        data.map(({ id, value }) => {
          return t.variableDeclarator(id, value);
        })
      )
    );
  }

  if (info.options.hmr) {
    puppetJsxAttributes.push(
      t.jsxAttribute(
        t.jsxIdentifier('_hmr'),
        t.stringLiteral(String(Date.now()))
      )
    );
  }

  /**
   * We want to change the Component's return from our original JSX
   * to the puppet call:
   *
   * ```js
   * const Component = (props) => {
   *  const [foo, setFoo] = useState(0);
   *  return <div>example...</div>
   * }
   * ```
   *
   * becomes:
   *
   * ```js
   * const Component = (props) => {
   *  const [foo, setFoo] = useState(0);
   *  return puppet({
   *    foo,
   *    bar: props.bar
   *  });
   * }
   * ```
   */
  let puppetCall: any = t.jsxElement(
    t.jsxOpeningElement(
      t.jsxIdentifier(puppetComponentId.name),
      puppetJsxAttributes,
      true
    ),
    null,
    []
  );

  if (portal.index !== -1) {
    const portalChildren = getUniqueId(returnStatementPath, 'P');
    returnStatementPath.insertBefore(
      t.variableDeclaration('let', [
        t.variableDeclarator(
          portalChildren,
          t.newExpression(t.identifier('Array'), [
            t.numericLiteral(portal.index + 1),
          ])
        ),
      ])
    );
    returnStatementPath.insertBefore(
      t.forStatement(
        t.variableDeclaration('let', [
          t.variableDeclarator(t.identifier('i'), t.numericLiteral(0)),
          t.variableDeclarator(
            t.identifier('l'),
            t.memberExpression(
              t.memberExpression(portal.id, t.identifier('$')),
              t.identifier('length')
            )
          ),
        ]),
        t.binaryExpression('<', t.identifier('i'), t.identifier('l')),
        t.updateExpression('++', t.identifier('i'), true),
        t.expressionStatement(
          t.assignmentExpression(
            '=',
            t.memberExpression(portalChildren, t.identifier('i'), true),
            t.optionalMemberExpression(
              t.memberExpression(
                t.memberExpression(portal.id, t.identifier('$')),
                t.identifier('i'),
                true
              ),
              t.identifier('portal'),
              undefined,
              true
            )
          )
        )
      )
    );
    returnStatementPath.insertBefore(
      t.callExpression(
        t.memberExpression(t.identifier('console'), t.identifier('log')),
        [t.stringLiteral('P'), t.identifier('P')]
      )
    );
    puppetCall = t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), [
      puppetCall,
      t.jsxExpressionContainer(portalChildren),
    ]);
  }

  if (layers.length) {
    let parent: t.JSXElement | t.JSXFragment | undefined;
    let current: t.JSXElement | t.JSXFragment | undefined;
    for (let i = 0, j = layers.length; i < j; ++i) {
      const layer = layers[i]!;
      if (!current) {
        current = layer;
        parent = current;
        continue;
      }
      current.children = [layer];
      current = layer;
    }
    current!.children = [puppetCall];
    puppetCall = parent;
  }

  returnStatementPath.replaceWith(t.returnStatement(puppetCall));

  // We run these later to mutate the JSX
  for (let i = 0, j = mutations.length; i < j; ++i) {
    mutations[i]?.();
  }

  /**
   * Component becomes our master component
   *
   * ```js
   * const Component = (props) => {
   * ```
   *
   * becomes:
   *
   * ```js
   * const master = (props) => {
   * ```
   */
  // export^3 const^2 Block^1 = block(Component)
  const exportNamedPath = callExpressionPath.parentPath.parentPath?.parentPath;
  const isCallExpressionExported = exportNamedPath?.isExportNamedDeclaration();

  if (isCallExpressionExported && publicComponent) {
    masterComponentId = publicComponent;
    const paths = exportNamedPath.replaceWith(
      t.exportNamedDeclaration(null, [
        t.exportSpecifier(publicComponent, publicComponent),
      ])
    );
    callExpressionPath.scope.registerDeclaration(paths[0]);
  } else {
    if (
      t.isIdentifier(componentDeclaration.id) &&
      componentName === masterComponentId.name
    ) {
      masterComponentId = getUniqueId(
        componentDeclarationPath,
        masterComponentId.name
      );
    }
    callExpressionPath.replaceWith(masterComponentId);
  }
  componentDeclaration.id = masterComponentId;

  componentDeclarationPath.parentPath.insertBefore(
    t.variableDeclaration('let', [
      t.variableDeclarator(puppetComponentId, puppetBlock),
    ])
  );

  if (isCallable) {
    componentDeclarationPath.parentPath.insertAfter(
      t.expressionStatement(
        t.assignmentExpression(
          '=',
          t.memberExpression(masterComponentId, t.identifier('_c')),
          t.booleanLiteral(true)
        )
      )
    );
  }

  if (t.isIdentifier(rawComponent)) {
    info.blocks.set(rawComponent.name, masterComponentId);
  }

  if (info.options.optimize || findComment(callExpression, '@optimize')) {
    const { variables, blockFactory } = optimize(
      callExpressionPath,
      info,
      holes,
      returnStatement.argument
    );

    callExpressionPath.parentPath.insertBefore(variables);

    const puppetBlockArguments = puppetBlock.arguments;

    puppetBlockArguments[0] = t.nullLiteral();
    puppetBlockArguments[1] = t.objectExpression([
      t.objectProperty(t.identifier('block'), blockFactory),
    ]);
  }
};

export const extractLayers = ({
  returnStatement,
  jsx,
  jsxPath,
  layers,
}: {
  returnStatement: t.ReturnStatement;
  jsx: t.JSXElement;
  jsxPath: NodePath<t.JSXElement>;
  layers: t.JSXElement[];
}): t.JSXElement[] => {
  const type = jsx.openingElement.name;
  if (
    (t.isJSXIdentifier(type) && isComponent(type.name)) ||
    t.isJSXMemberExpression(type)
  ) {
    trimJSXChildren(jsx);
    const firstChild = jsx.children[0];
    if (jsx.children.length === 1 && t.isJSXElement(firstChild)) {
      jsxPath.replaceWith(firstChild);
      returnStatement.argument = firstChild;
      jsx.children = [];
      layers.push(jsx);

      return extractLayers({
        returnStatement,
        jsx: firstChild,
        jsxPath,
        layers,
      });
    }
  }
  return layers;
};

export const transformJSX = (
  hoisted: HoistedMap,
  mutations: (() => void)[],
  portal: {
    index: number;
    id: t.Identifier;
  },
  info: Info,
  {
    jsx,
    jsxPath,
    componentBodyPath,
    isRoot,
  }: {
    jsx: t.JSXElement;
    jsxPath: NodePath<t.JSXElement>;
    componentBodyPath: NodePath<t.BlockStatement>;
    isRoot: boolean;
  },
  unstable: boolean
): HoistedMap => {
  /**
   * Populates `dynamics` with a new entry.
   *
   * A dynamic can be of two types:
   *
   * 1. Has identifier but no expression:
   *    <div>{foo}</div>
   *
   * 2. Has expression but no identifier:
   *    <div>{foo + 1}</div>
   */
  const createDynamic = (
    identifier: t.Identifier | null,
    expression: t.Expression | null,
    path: NodePath | null,
    callback: (() => void) | null
  ): t.Identifier | undefined => {
    if (expression && path) {
      // check for ids:
      const hasValidId = findChild<t.Identifier>(
        path,
        'Identifier',
        (p: NodePath<t.Identifier>) => {
          return path.scope.hasBinding(p.node.name);
        }
      );
      if (!hasValidId) return;
    }

    /**
     * We need to generate some arbitrary id for expressions, since
     * the runtime doesn't allow lone expressions:
     *
     * ```js
     * <div>{foo + 1}</div>
     * ```
     *
     * becomes:
     *
     * ```
     * _1$ = foo + 1
     *
     * <div>{_1$}</div>
     * ```
     */
    const id = identifier || componentBodyPath.scope.generateUidIdentifier('');

    if (!hoisted[id.name]) {
      hoisted[id.name] = { value: expression, id };
    }
    // Sometimes, we require a mutation to the JSX. We defer this for later use.
    mutations.push(callback!);
    return id;
  };

  let renderReactScope: t.Identifier | null = null;
  const createPortal = (
    callback: () => void,
    _arguments: (
      | t.Expression
      | t.ArgumentPlaceholder
      | t.JSXNamespacedName
      | t.SpreadElement
    )[]
  ): t.Identifier | undefined => {
    renderReactScope ??= addImport(
      jsxPath,
      'renderReactScope',
      info.imports.source || 'million/react',
      info
    );
    const index = ++portal.index;

    const refCurrent = t.memberExpression(portal.id, t.identifier('$'));
    const nestedRender = t.callExpression(renderReactScope, [
      ..._arguments,
      refCurrent,
      t.numericLiteral(index),
      t.booleanLiteral(Boolean(info.options.server)),
    ]);
    const id = createDynamic(null, nestedRender, null, callback);
    return id;
  };

  const type = jsx.openingElement.name;

  // if (!t.isJSXElement(jsx) && !t.isJSXFragment(jsx) && isRoot) {
  //   throw deopt(null, callExpressionPath);
  // }

  /**
   * If the JSX type is Capitalized, we assume it's a component. We then turn that
   * JSX into the raw function calls and hoist it as a dynamic with a `renderScope`:
   *
   * ```js
   * <Component foo={bar} />
   * ```
   *
   * becomes:
   *
   * ```js
   * _1$ = renderReactScope(createElement(Component, { foo: bar }))
   *
   * {_1$}
   * ```
   *
   * This is where Million.js defers to React to handle the rendering,
   * as components are basically impossible to statically analyze while
   * handing all the edge cases.
   */
  if (t.isJSXIdentifier(type) && isComponent(type.name)) {
    // TODO: Add a warning for using components that are not block or For
    // warn(
    //   'Components will cause degraded performance. Ideally, you should use DOM elements instead.',
    //   jsxPath,
    //   options.mute,
    // );

    const id = createPortal(() => {
      jsxPath.replaceWith(
        isRoot ? t.expressionStatement(id!) : t.jsxExpressionContainer(id!)
      );
    }, [
      jsx,
      type.name === 'For'
        ? t.booleanLiteral(false)
        : t.booleanLiteral(unstable),
    ]);

    return hoisted;
  }
  if (t.isJSXMemberExpression(type)) {
    const id = createPortal(() => {
      jsxPath.replaceWith(
        isRoot ? t.expressionStatement(id!) : t.jsxExpressionContainer(id!)
      );
    }, [jsx, t.booleanLiteral(unstable)]);

    return hoisted;
  }

  /**
   * Now, it's time to handle the DOM element case.
   */
  const { attributes } = jsx.openingElement;

  for (let i = 0, j = attributes.length; i < j; i++) {
    const attribute = attributes[i]!;

    if (t.isJSXSpreadAttribute(attribute)) {
      const spreadPath = jsxPath.get(
        `openingElement.attributes.${i}.argument`
      ) as NodePath<t.JSXSpreadChild>;
      warn(
        'Spread attributes are not fully supported.',
        info.filename,
        spreadPath
      );

      const id = createPortal(() => {
        jsxPath.replaceWith(
          isRoot ? t.expressionStatement(id!) : t.jsxExpressionContainer(id!)
        );
      }, [jsx, t.booleanLiteral(unstable)]);

      return hoisted;
    }

    if (
      t.isJSXIdentifier(attribute.name) &&
      attribute.name.name === 'style' &&
      t.isJSXExpressionContainer(attribute.value) &&
      t.isObjectExpression(attribute.value.expression)
    ) {
      const styleObject = attribute.value.expression;
      const properties = styleObject.properties;

      let hasDynamic = false;
      for (let l = 0, k = properties.length; l < k; l++) {
        const property = properties[l]!;
        if (t.isObjectProperty(property)) {
          if (property.computed) {
            // TODO: possibly explore style object extraction in the future.
            throw deopt(
              'Computed properties are not supported in style objects.',
              info.filename,
              jsxPath
            );
          }

          const value = property.value;
          if (t.isBooleanLiteral(value) || t.isNullLiteral(value)) {
            if (t.isNullLiteral(value) || !value.value) {
              properties.splice(l, 1);
              l -= 2;
              // checked={true} -> checked="checked"
            } else if (t.isIdentifier(property.key)) {
              property.value = t.stringLiteral(property.key.name);
            }
          }

          if (
            t.isNumericLiteral(value) &&
            t.isIdentifier(property.key) &&
            !NO_PX_PROPERTIES.includes(property.key.name)
          ) {
            property.value = t.stringLiteral(`${value.value}px`);
          }

          if (t.isIdentifier(value)) {
            createDynamic(value, null, null, null);
            hasDynamic = true;
          } else if (t.isLiteral(value) && !t.isTemplateLiteral(value)) {
            if (t.isStringLiteral(value)) {
              property.value = value;
            }
          } else {
            const expressionPath = jsxPath.get(
              `openingElement.attributes.${i}.value.expression.properties.${l}.value`
            ) as NodePath<t.Expression>;

            const id = createDynamic(
              null,
              value as t.Expression,
              expressionPath,
              () => {
                if (id) property.value = id;
              }
            );
            hasDynamic = true;
          }
        } else {
          hasDynamic = true;
        }
      }
      if (!hasDynamic) {
        mutations.push(() => {
          if (portal.index !== -1) return;
          attribute.value = t.stringLiteral(
            styleObject.properties
              .map((property) => {
                if (t.isObjectProperty(property)) {
                  const value = property.value;
                  const key = property.key;
                  if (t.isIdentifier(key) && t.isLiteral(value)) {
                    let kebabKey = '';
                    for (let i = 0, j = key.name.length; i < j; ++i) {
                      const char = key.name.charCodeAt(i);
                      if (char < 97) {
                        // If letter is uppercase
                        kebabKey += `-${String.fromCharCode(char + 32)}`;
                      } else {
                        kebabKey += key.name[i];
                      }
                    }
                    if (
                      t.isNullLiteral(value) ||
                      t.isRegExpLiteral(value) ||
                      t.isTemplateLiteral(value)
                    )
                      return '';
                    return `${kebabKey}:${String(value.value)}`;
                  }
                }
                return null;
              })
              .filter((property) => property)
              .join(';')
          );
        });
      }
      continue;
    }

    if (t.isJSXExpressionContainer(attribute.value)) {
      const attributeValue = attribute.value;
      const expressionPath = jsxPath.get(
        `openingElement.attributes.${i}.value.expression`
      ) as NodePath<t.Expression>;
      const { ast: expression, err } = evaluate(
        attributeValue.expression,
        expressionPath.scope
      );

      if (
        t.isJSXIdentifier(attribute.name) &&
        isAttributeUnsupported(attribute)
      ) {
        const id = createPortal(() => {
          jsxPath.replaceWith(
            isRoot ? t.expressionStatement(id!) : t.jsxExpressionContainer(id!)
          );
        }, [jsx, t.booleanLiteral(unstable)]);

        return hoisted;
      }

      if (!err) attributeValue.expression = expression;

      if (t.isIdentifier(expression)) {
        if (attribute.name.name === 'ref') {
          const id = createPortal(() => {
            jsxPath.replaceWith(
              isRoot
                ? t.expressionStatement(id!)
                : t.jsxExpressionContainer(id!)
            );
          }, [jsx, t.booleanLiteral(unstable)]);

          return hoisted;
        }
        createDynamic(expression, null, null, null);
      } else if (isStaticAttributeValue(expression)) {
        if (t.isStringLiteral(expression)) {
          attribute.value = expression;
        }
        // if other type of literal, do nothing
      } else {
        const id = createDynamic(
          null,
          expression as t.Expression,
          expressionPath,
          () => {
            if (id) attributeValue.expression = id;
          }
        );
      }
    }
  }

  for (let i = 0; i < jsx.children.length; i++) {
    const child = jsx.children[i]!;

    if (t.isJSXText(child)) continue;

    if (t.isJSXSpreadChild(child)) {
      const spreadPath = jsxPath.get(
        `children.${i}`
      ) as NodePath<t.JSXSpreadChild>;
      warn(
        'Spread children are not fully supported.',
        info.filename,
        spreadPath
      );
      const id = createPortal(() => {
        jsxPath.replaceWith(t.jsxExpressionContainer(id!));
      }, [jsx, t.booleanLiteral(unstable)]);

      continue;
    }

    if (isJSXFragment(child)) {
      /**
       * Removes fragment and "spreads out" children at that index:
       *
       * ```js
       * <div>
       *  <one />
       *  <>
       *    <two />
       *    <three />
       *  </>
       *  <four />
       * </div>
       * ```
       *
       * becomes:
       *
       * ```js
       * <div>
       *  <one />
       *  <two />
       *  <three />
       *  <four />
       * </div>
       * ```
       */
      jsx.children.splice(i, 1);
      jsx.children.splice(i, 0, ...child.children);
      i--; // revisit this index since we inserted new children
      continue;
    }

    if (t.isJSXExpressionContainer(child)) {
      const expressionPath = jsxPath.get(
        `children.${i}.expression`
      ) as NodePath<t.Expression>;
      const { ast: expression, err } = evaluate(
        child.expression,
        expressionPath.scope
      );

      if (!err) child.expression = expression;

      if (
        t.isLiteral(expression) &&
        !t.isTemplateLiteral(expression) // `${foo} test` will be a template literal
      ) {
        if (t.isStringLiteral(expression)) {
          child.expression = expression;
        }
        continue;
      }

      if (t.isIdentifier(expression)) {
        createDynamic(expression, null, null, null);
        continue;
      }

      if (t.isJSXElement(expression)) {
        const type = expression.openingElement.name;
        if (t.isJSXIdentifier(type) && !isComponent(type.name)) {
          /**
           * Handles raw JSX elements as expressions:
           *
           * ```js
           * <div>{<nested />}</div>
           * ```
           */
          transformJSX(
            hoisted,
            mutations,
            portal,
            info,
            {
              jsx: expression,
              jsxPath: jsxPath.get(`children.${i}`) as NodePath<t.JSXElement>,
              componentBodyPath,
              isRoot: false,
            },
            unstable
          );
          jsx.children[i] = expression;
          continue;
        }
        if (t.isJSXMemberExpression(type)) {
          const id = createPortal(() => {
            jsx.children[i] = t.jsxExpressionContainer(id!);
          }, [expression, t.booleanLiteral(unstable)]);

          continue;
        }
      }

      if (t.isExpression(expression)) {
        if (!err) child.expression = expression;
        /**
         * Handles JSX lists and converts them to optimized <For /> components:
         *
         * ```js
         * <div>{[1, 2, 3].map(i => <div>{i}</div>)}</div>
         * ```
         *
         * becomes:
         *
         * ```js
         * <div><For each={[1, 2, 3]}>{i => <div>{i}</div>}</For></div>
         * ```
         */
        const expressionPath = jsxPath.get(
          `children.${i}.expression`
        ) as NodePath<t.Expression>;
        const hasSensitive =
          expressionPath.parentPath.isJSXExpressionContainer() &&
          t.isJSXElement(expressionPath.parentPath.parent) &&
          isSensitiveJSXElement(expressionPath.parentPath.parent);

        if (
          t.isCallExpression(expression) &&
          t.isMemberExpression(expression.callee) &&
          t.isIdentifier(expression.callee.property, { name: 'map' }) &&
          !hasSensitive
        ) {
          const For = addImport(
            jsxPath,
            'For',
            info.imports.source || 'million/react',
            info
          );
          const jsxFor = t.jsxIdentifier(For.name);
          const newJsxArrayIterator = t.jsxElement(
            t.jsxOpeningElement(jsxFor, [
              t.jsxAttribute(
                t.jsxIdentifier('each'),
                t.jsxExpressionContainer(expression.callee.object)
              ),
            ]),
            t.jsxClosingElement(jsxFor),
            [t.jsxExpressionContainer(expression.arguments[0] as t.Expression)]
          );

          const id = createPortal(() => {
            jsx.children[i] = t.jsxExpressionContainer(id!);
          }, [newJsxArrayIterator, t.booleanLiteral(unstable)]);

          continue;
        }

        /**
         * Handles JSX conditionals and shoves them into a render scope:
         *
         * ```js
         * <div>{condition ? <div /> : <span />}</div>
         * ```
         *
         * becomes:
         *
         * ```js
         * _1$ = renderReactScope(condition ? <div /> : <span />);
         *
         * <div>{_1$}</div>
         * ```
         */
        if (
          t.isConditionalExpression(expression) ||
          t.isLogicalExpression(expression)
        ) {
          warn(
            'Conditional expressions will degrade performance. We recommend using deterministic returns instead.',
            info.filename,
            expressionPath,
            info.options.log
          );

          const id = createPortal(() => {
            jsx.children[i] = t.jsxExpressionContainer(id!);
          }, [expression, t.booleanLiteral(unstable)]);

          continue;
        }

        let foundJsxInExpression = false;
        expressionPath.traverse({
          JSXElement(path) {
            foundJsxInExpression = true;
            path.stop();
          },
          JSXFragment(path) {
            foundJsxInExpression = true;
            path.stop();
          },
        });
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (foundJsxInExpression) {
          const id = createPortal(() => {
            if (hasSensitive) {
              return jsxPath.replaceWith(
                isRoot
                  ? t.expressionStatement(id!)
                  : t.jsxExpressionContainer(id!)
              );
            }
            jsx.children[i] = t.jsxExpressionContainer(id!);
          }, [hasSensitive ? jsx : expression, t.booleanLiteral(unstable)]);

          continue;
        }

        const id = createDynamic(null, expression, expressionPath, () => {
          if (id) child.expression = id;
        });
      }

      continue;
    }

    const jsxChildPath = jsxPath.get(`children.${i}`);

    transformJSX(
      hoisted,
      mutations,
      portal,
      info,
      {
        jsx: child,
        jsxPath: jsxChildPath as NodePath<t.JSXElement>,
        componentBodyPath,
        isRoot: false,
      },
      unstable
    );
  }
  return hoisted;
};
