import * as t from '@babel/types';
import { createDirtyChecker } from './experimental/utils';
import { optimize } from './experimental/optimize';
import { NO_PX_PROPERTIES, RENDER_SCOPE, SVG_ELEMENTS } from './constants';
import { addImport } from './utils/mod';
import { deopt, warn } from './utils/log';
import { evaluate } from './utils/evaluate';
import {
  isComponent,
  isJSXFragment,
  trimJSXChildren,
  isAttributeUnsupported,
  isSensitiveJSXElement,
  isStaticAttributeValue,
  handleTopLevelFragment,
} from './utils/jsx';
import { getUniqueId } from './utils/id';
import { dedupeObjectProperties } from './utils/object';
import type { Options } from './options';
import type { Info } from './visit';
import type { NodePath } from '@babel/core';
import { resolveImportSource } from './utils/mod';
import { findChild, findChildMultiple, findComment } from './utils/ast';

export interface Shared {
  file: string;
  callSitePath: NodePath<t.CallExpression>;
  callSite: t.CallExpression;
  Component: t.VariableDeclarator | t.FunctionDeclaration;
  RawComponent: t.Identifier | t.FunctionExpression | t.ArrowFunctionExpression;
  blockCache: Map<string, t.Identifier>;
  originalComponent: t.VariableDeclarator | t.FunctionDeclaration;
  unstable: boolean;
  info: Info;
}

export interface Dynamics {
  cache: Set<string>;
  data: {
    id: t.Identifier;
    value: t.Expression | null;
  }[];
  deferred: (() => void)[];
  portalInfo: {
    index: number;
    id: t.Identifier;
  };
}

export const transformBlock = (
  options: Options,
  path: NodePath<t.CallExpression>,
  blockCache: Map<string, t.Identifier>,
  dirname: string,
  info: Info,
  unstable = false,
  skipCheck = false
) => {
  const callSite = path.node;

  // validate that callee is block
  if (
    !t.isIdentifier(callSite.callee) ||
    !info.aliases.block[callSite.callee.name] ||
    !info.block
  ) {
    if (!skipCheck) return;
  }

  // Allow the user to opt into experimental optimization by adding a
  // /* @optimize */ in front of the block call.
  if (findComment(callSite, '@optimize')) {
    options.optimize = true;
  }

  const RawComponent = callSite.arguments[0];

  if (
    !t.isIdentifier(RawComponent) &&
    !t.isFunctionDeclaration(RawComponent) &&
    !t.isFunctionExpression(RawComponent) &&
    !t.isArrowFunctionExpression(RawComponent)
  ) {
    throw deopt(
      'Unsupported argument for block. Make sure blocks consume a component ' +
        'function or component reference',
      dirname,
      path
    );
  }

  if (t.isIdentifier(RawComponent) && blockCache.has(RawComponent.name)) {
    throw deopt(
      'Found duplicate block. Make sure you are not using block() ' +
        'on the same component more than once.',
      dirname,
      path
    );
  }

  /**
   * Replaces `export default block(Component)` with
   * const default$ = block(Component);
   * export default default$;
   *
   * https://astexplorer.net/#/gist/f2e819d384d8ed976cc9a9a02ba5e4f3/latest
   */
  const exportPath = path.parentPath;
  if (exportPath.isExportDefaultDeclaration()) {
    let name: string;
    if (t.isIdentifier(RawComponent)) {
      name = RawComponent.name;
    } else if (
      t.isFunctionExpression(RawComponent) &&
      t.isIdentifier(RawComponent.id)
    ) {
      name = RawComponent.id.name;
    } else {
      name = 'default$';
    }

    const exportId = getUniqueId(path, name);
    exportPath.replaceWithMultiple([
      t.variableDeclaration('const', [
        t.variableDeclarator(exportId, callSite),
      ]),
      t.exportDefaultDeclaration(exportId),
    ]);

    // this "creates" a new callSitePath, so it will be picked up again on the
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
    t.isFunctionExpression(RawComponent) ||
    t.isArrowFunctionExpression(RawComponent)
  ) {
    const name =
      t.isFunctionExpression(RawComponent) && t.isIdentifier(RawComponent.id)
        ? RawComponent.id.name
        : 'Anonymous';
    const anonymousComponentId = getUniqueId(info.programPath, name);

    /**
     * Replaces function expression with identifier
     * `block(() => ...)` to `block(anonymous)`
     */
    path.replaceWithMultiple([
      t.variableDeclaration('const', [
        t.variableDeclarator(anonymousComponentId, RawComponent),
      ]),
      t.callExpression(callSite.callee, [anonymousComponentId]),
    ]);

    // this "creates" a new callSitePath, so it will be picked up again on the
    // next visitor call. no need to continue.
    return;
  }

  const componentDeclarationPath = path.scope.getBinding(
    RawComponent.name
  )!.path;

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
        let name = 'Anonymous';
        if (isId) {
          name = forwardRefComponent.name;
        } else if (isFunction && t.isIdentifier(forwardRefComponent.id)) {
          name = forwardRefComponent.id.name;
        }

        const anonymousComponentId = getUniqueId(info.programPath, name);
        componentDeclarationPath.replaceWithMultiple([
          t.variableDeclaration('const', [
            t.variableDeclarator(
              anonymousComponentId,
              t.callExpression(t.identifier(info.block!.name), [
                forwardRefComponent,
              ])
            ),
          ]),
          t.variableDeclaration('const', [
            t.variableDeclarator(
              componentDeclarationPath.node.id,
              t.callExpression(callSite.callee, [anonymousComponentId])
            ),
          ]),
        ]);

        const { parent, node } = path;
        if (
          t.isVariableDeclarator(parent) &&
          'arguments' in node &&
          t.isIdentifier(node.arguments[0])
        ) {
          path.parentPath.replaceWith(t.variableDeclarator(node.arguments[0]));
        }

        // this "creates" a new callSitePath, so it will be picked up again on the
        // next visitor call. no need to continue.
        return;
      }
    }
  }

  const Component = componentDeclarationPath.node as
    | t.VariableDeclarator
    | t.FunctionDeclaration;

  // We clone the component so we can restore it later.
  const originalComponent = t.cloneNode(Component);

  const SHARED: Shared = {
    file: dirname,
    callSitePath: path,
    callSite,
    Component,
    RawComponent,
    blockCache,
    originalComponent,
    unstable,
    info,
  };

  if (
    t.isVariableDeclarator(Component) &&
    t.isArrowFunctionExpression(Component.init)
  ) {
    if (
      !t.isBlockStatement(Component.init.body) &&
      t.isJSXElement(Component.init.body)
    ) {
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
      Component.init.body = t.blockStatement([
        t.returnStatement(Component.init.body),
      ]);
    }

    /*
     * Variable Declaration w/ Arrow Function:
     *
     * ```js
     * const Component = () => {
     *  return <div />;
     * }
     *  ```
     */
    transformComponent(
      options,
      {
        componentBody: Component.init.body as t.BlockStatement,
        componentBodyPath: componentDeclarationPath.get(
          'init.body'
        ) as NodePath<t.BlockStatement>,
        componentDeclarationPath,
      },
      SHARED
    );
  } else if (t.isFunctionDeclaration(Component)) {
    /**
     * Function Declaration:
     *
     * ```js
     * function Component() {
     *  return <div />;
     * }
     * ```
     */
    transformComponent(
      options,
      {
        componentBody: Component.body,
        componentBodyPath: componentDeclarationPath.get(
          'body'
        ) as NodePath<t.BlockStatement>,
        componentDeclarationPath,
      },
      SHARED
    );
  } else if (t.isImportSpecifier(Component)) {
    throw deopt(
      'You are using a component imported from another file. The component must be colocated in the same file as the block.',
      dirname,
      componentDeclarationPath
    );
  } else {
    throw deopt(
      'You can only use block() with a function declaration or arrow function.',
      dirname,
      path
    );
  }
};

export const transformComponent = (
  options: Options,
  {
    componentBody,
    componentBodyPath,
    componentDeclarationPath,
  }: {
    componentBody: t.BlockStatement;
    componentBodyPath: NodePath<t.BlockStatement>;
    componentDeclarationPath: NodePath<
      t.VariableDeclarator | t.FunctionDeclaration
    >;
  },
  SHARED: Shared
) => {
  const {
    info,
    file,
    callSite,
    callSitePath,
    Component,
    RawComponent,
    blockCache,
    originalComponent,
  } = SHARED;

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
  if (!t.isBlockStatement(componentBody)) {
    throw deopt(
      'Expected a block statement function() { /* block */ } in your function ' +
        'body. Make sure you are using a function declaration or arrow function.',
      file,
      callSitePath
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
  const statementsInBody = componentBody.body.length;

  const returnStatementPaths = findChildMultiple<t.ReturnStatement>(
    componentBodyPath,
    'ReturnStatement'
  );

  if (!returnStatementPaths.length) {
    throw deopt(
      'Expected a return statement in your component',
      file,
      componentBodyPath
    );
  }

  if (returnStatementPaths.length > 1) {
    throw deopt(
      'Expected only one return statement in your component',
      file,
      componentBodyPath
    );
  }

  const returnStatementPath = returnStatementPaths[0]!;
  const returnStatement = returnStatementPath.node;

  if (isJSXFragment(returnStatement.argument)) {
    handleTopLevelFragment(returnStatement);
  }

  /**
   * We then must statically analyze the JSX. We create a special object
   * called `dynamics`, which will serve as our central store as we extract
   * out "dynamic expressions" from the JSX.
   */
  const dynamics: Dynamics = {
    data: [], // expression value and id
    cache: new Set(), // cache to check if id already exists to prevent dupes
    deferred: [], // callback (() => void) functions that run mutations on the JSX
    portalInfo: {
      index: -1,
      id: componentBodyPath.scope.generateUidIdentifier('portal'),
    },
  };

  if (!t.isJSXElement(returnStatement.argument)) {
    throw deopt(null, file, callSitePath);
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
  let masterComponentId = t.isIdentifier(originalComponent.id)
    ? originalComponent.id
    : getUniqueId(callSitePath, 'M$');
  const puppetComponentId = getUniqueId(callSitePath, 'P$');

  const block = addImport('block', 'million/react', info);

  const layers: t.JSXElement[] = extractLayers(
    options,
    {
      returnStatement,
      originalComponent,
      jsx: returnStatement.argument,
      jsxPath: returnStatementPath.get('argument') as NodePath<t.JSXElement>,
      layers: [],
    },
    SHARED
  );

  // This function will automatically populate the `dynamics` for us:
  transformJSX(
    options,
    {
      jsx: returnStatement.argument,
      jsxPath: returnStatementPath.get('argument') as NodePath<t.JSXElement>,
      componentBody,
      componentBodyPath,
      dynamics,
      isRoot: true,
    },
    SHARED
  );

  if (!dynamics.data.length && options.server) {
    throw deopt(null, file, callSitePath);
  }

  const isCallable =
    statementsInBody === 1 &&
    layers.length === 0 &&
    dynamics.portalInfo.index === -1;

  /**
   * ```js
   * const puppet = block(({ foo }) => {
   *  return ...
   * }, { shouldUpdate: (oldProps, newProps) => oldProps.foo !== newProps.foo })
   * ```
   */

  const holes = dynamics.data.map(({ id }) => id.name);

  const originalObjectExpression = callSite.arguments[1] as
    | t.ObjectExpression
    | undefined;

  const originalOptions: Record<string, any> = {};

  if (originalObjectExpression) {
    for (const prop of originalObjectExpression.properties) {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        originalOptions[prop.key.name] = prop.value;
      }
    }
  }

  const compiledOptions = [
    t.objectProperty(
      t.identifier('svg'),
      // we try to automatically detect if the component is an SVG
      t.booleanLiteral(
        originalOptions.svg ??
          (t.isJSXElement(returnStatement.argument) &&
            t.isJSXIdentifier(returnStatement.argument.openingElement.name) &&
            SVG_ELEMENTS.includes(
              returnStatement.argument.openingElement.name.name
            ))
      )
    ),
    t.objectProperty(t.identifier('shouldUpdate'), createDirtyChecker(holes)),
  ];

  const puppetFn = t.arrowFunctionExpression(
    [
      t.objectPattern(
        dynamics.data.map(({ id }) => t.objectProperty(id, id, false, true))
      ),
    ],
    t.blockStatement([returnStatement])
  );

  const puppetBlock = t.callExpression(block, [
    puppetFn,
    t.objectExpression(dedupeObjectProperties(compiledOptions)),
  ]);

  const data: (typeof dynamics)['data'] = [];

  if (dynamics.portalInfo.index !== -1) {
    const useState = addImport('useState', 'react', info);
    data.push({
      id: dynamics.portalInfo.id,
      value: t.memberExpression(
        t.callExpression(useState, [
          t.arrowFunctionExpression(
            [],
            t.objectExpression([
              t.objectProperty(
                t.identifier('$'),
                t.newExpression(t.identifier('Array'), [
                  t.numericLiteral(dynamics.portalInfo.index + 1),
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

  for (const { id, value } of dynamics.data) {
    if (!value) continue;

    data.push({ id, value });
  }

  if (data.length) {
    returnStatementPath.insertBefore(
      t.variableDeclaration(
        'const',
        data.map(({ id, value }) => {
          return t.variableDeclarator(id, value);
        })
      )
    );
  }

  const puppetJsxAttributes = dynamics.data.map(({ id }) =>
    t.jsxAttribute(t.jsxIdentifier(id.name), t.jsxExpressionContainer(id))
  );

  if (options.hmr) {
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

  if (dynamics.portalInfo.index !== -1) {
    puppetCall = t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), [
      puppetCall,
      t.jsxExpressionContainer(
        t.callExpression(
          t.memberExpression(
            t.memberExpression(dynamics.portalInfo.id, t.identifier('$')),
            t.identifier('map')
          ),
          [
            t.arrowFunctionExpression(
              [t.identifier('p')],
              t.memberExpression(t.identifier('p'), t.identifier('portal'))
            ),
          ]
        )
      ),
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

  componentBody.body[data.length ? statementsInBody : statementsInBody - 1] =
    t.returnStatement(puppetCall);

  // We run these later to mutate the JSX
  for (let i = 0, j = dynamics.deferred.length; i < j; ++i) {
    dynamics.deferred[i]?.();
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

  if (
    t.isIdentifier(Component.id) &&
    Component.id.name === masterComponentId.name
  ) {
    masterComponentId = getUniqueId(
      componentDeclarationPath,
      masterComponentId.name
    );
  }
  Component.id = masterComponentId;
  callSitePath.replaceWith(masterComponentId);

  componentDeclarationPath.insertBefore(
    t.variableDeclaration('const', [
      t.variableDeclarator(puppetComponentId, puppetBlock),
    ])
  );

  if (isCallable) {
    componentDeclarationPath.insertBefore(
      t.expressionStatement(
        t.assignmentExpression(
          '=',
          t.memberExpression(
            masterComponentId,
            t.identifier('__block_callable__')
          ),
          t.booleanLiteral(true)
        )
      )
    );
  }

  if (t.isIdentifier(RawComponent)) {
    blockCache.set(RawComponent.name, masterComponentId);
  }

  if (options.optimize) {
    const { variables, blockFactory } = optimize(
      options,
      {
        holes,
        jsx: returnStatement.argument,
      },
      SHARED
    );

    callSitePath.parentPath.insertBefore(variables);

    const puppetBlockArguments = puppetBlock.arguments;

    puppetBlockArguments[0] = t.nullLiteral();
    puppetBlockArguments[1] = t.objectExpression([
      t.objectProperty(t.identifier('block'), blockFactory),
    ]);
  }
};

export const extractLayers = (
  options: Options,
  {
    returnStatement,
    originalComponent,
    jsx,
    jsxPath,
    layers,
  }: {
    returnStatement: t.ReturnStatement;
    originalComponent: t.FunctionDeclaration | t.VariableDeclarator;
    jsx: t.JSXElement;
    jsxPath: NodePath<t.JSXElement>;
    layers: t.JSXElement[];
  },
  SHARED: Shared
): t.JSXElement[] => {
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

      return extractLayers(
        options,
        {
          returnStatement,
          originalComponent,
          jsx: firstChild,
          jsxPath,
          layers,
        },
        SHARED
      );
    }
  }
  return layers;
};

export const transformJSX = (
  options: Options,
  {
    jsx,
    jsxPath,
    componentBody,
    componentBodyPath,
    dynamics,
    isRoot,
  }: {
    jsx: t.JSXElement;
    jsxPath: NodePath<t.JSXElement>;
    componentBody: t.BlockStatement;
    componentBodyPath: NodePath<t.BlockStatement>;
    dynamics: Dynamics;
    isRoot: boolean;
  },
  SHARED: Shared
) => {
  const { file, info, unstable } = SHARED;

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
      let hasValidId = false;
      path.traverse({
        Identifier(path) {
          if (path.scope.hasBinding(path.node.name)) {
            hasValidId = true;
            path.stop();
          }
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

    if (!dynamics.cache.has(id.name)) {
      dynamics.data.push({ value: expression, id });
      dynamics.cache.add(id.name);
    }
    // Sometimes, we require a mutation to the JSX. We defer this for later use.
    dynamics.deferred.push(callback!);
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
  ) => {
    renderReactScope ??= addImport(
      'renderReactScope',
      importSource.value,
      info
    );
    const index = ++dynamics.portalInfo.index;

    const refCurrent = t.memberExpression(
      dynamics.portalInfo.id,
      t.identifier('$')
    );
    const nestedRender = t.callExpression(renderReactScope!, [
      ..._arguments,
      refCurrent,
      t.numericLiteral(index),
      t.booleanLiteral(Boolean(options.server)),
    ]);
    const id = createDynamic(null, nestedRender, null, callback);
    return id;
  };

  const type = jsx.openingElement.name;

  // if (!t.isJSXElement(jsx) && !t.isJSXFragment(jsx) && isRoot) {
  //   throw deopt(null, callSitePath);
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

    return dynamics;
  }
  if (t.isJSXMemberExpression(type)) {
    const id = createPortal(() => {
      jsxPath.replaceWith(
        isRoot ? t.expressionStatement(id!) : t.jsxExpressionContainer(id!)
      );
    }, [jsx, t.booleanLiteral(unstable)]);

    return dynamics;
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
      warn('Spread attributes are not fully supported.', file, spreadPath);

      const id = createPortal(() => {
        jsxPath.replaceWith(
          isRoot ? t.expressionStatement(id!) : t.jsxExpressionContainer(id!)
        );
      }, [jsx, t.booleanLiteral(unstable)]);

      return dynamics;
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
              file,
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
        dynamics.deferred.push(() => {
          if (dynamics.portalInfo.index !== -1) return;
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

        return dynamics;
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

          return dynamics;
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
      warn('Spread children are not fully supported.', file, spreadPath);
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
            options,
            {
              jsx: expression,
              jsxPath: jsxPath.get(`children.${i}`) as NodePath<t.JSXElement>,
              componentBody,
              componentBodyPath,
              dynamics,
              isRoot: false,
            },
            SHARED
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
          const For = addImport('For', importSource.value, info);
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
            file,
            expressionPath,
            options.mute
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
      options,
      {
        jsx: child,
        jsxPath: jsxChildPath as NodePath<t.JSXElement>,
        componentBody,
        componentBodyPath,
        dynamics,
        isRoot: false,
      },
      SHARED
    );
  }
  return dynamics;
};
