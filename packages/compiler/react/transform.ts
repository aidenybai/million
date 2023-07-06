import * as t from '@babel/types';
import { createDirtyChecker } from '../experimental/utils';
import {
  createDeopt,
  resolvePath,
  warn,
  isComponent,
  trimFragmentChildren,
  normalizeProperties,
  SVG_ELEMENTS,
  RENDER_SCOPE,
} from './utils';
import { optimize } from './optimize';
import type { Options } from '../plugin';
import type { Dynamics, Shared } from './types';
import type { NodePath } from '@babel/core';

export const transformComponent = (
  options: Options,
  {
    componentBody,
    componentBodyPath,
  }: {
    componentBody: t.BlockStatement;
    componentBodyPath: NodePath<t.Node>;
  },
  SHARED: Shared,
) => {
  const {
    isReact,
    callSite,
    callSitePath,
    Component,
    originalComponent,
    globalPath,
    imports,
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
    throw createDeopt(
      'Expected a block statement for the component function body. Make sure you are using a function declaration or arrow function.',
      callSitePath,
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

  for (let i = 0; i < statementsInBody; ++i) {
    const node = componentBody.body[i];
    if (!t.isIfStatement(node)) continue;
    if (
      t.isReturnStatement(node.consequent) ||
      (t.isBlockStatement(node.consequent) &&
        // Look for an early return in the consequent block
        node.consequent.body.some((n) => t.isReturnStatement(n)))
    ) {
      const ifStatementPath = componentBodyPath.get(`body.${i}.consequent`);

      throw createDeopt(
        'You cannot use multiple returns in blocks. There can only be one return statement at the end of the block.',
        callSitePath,
        resolvePath(ifStatementPath),
      );
    }
    // Checks if the last statement is a return statement
    if (statementsInBody === i - 1 && !t.isReturnStatement(node)) {
      throw createDeopt(
        'There must be a return statement at the end of the block.',
        callSitePath,
        resolvePath(componentBodyPath.get(`body.${i}`)),
      );
    }
  }

  const returnStatement = componentBody.body[
    statementsInBody - 1
  ] as t.ReturnStatement;
  const jsxPath = resolvePath(
    componentBodyPath.get(`body.${statementsInBody - 1}.argument`),
  );

  /**
   * Turns top-level JSX fragmentsinto a render scope. This is because
   * the runtime API does not currently handle fragments. We will deal with
   * nested fragments later.
   *
   * ```js
   * function Component() {
   *  return <>
   *   <div />
   *  </>;   * }
   *
   * // becomes
   *
   * function Component() {
   *  return <slot>
   *    <div />
   *  </slot>;
   * }
   * ```
   */
  const handleTopLevelFragment = (jsx: t.JSXFragment) => {
    trimFragmentChildren(jsx);
    if (jsx.children.length === 1) {
      const child = jsx.children[0];
      if (t.isJSXElement(child)) {
        returnStatement.argument = child;
      } else if (t.isJSXExpressionContainer(child)) {
        if (t.isJSXEmptyExpression(child.expression)) {
          returnStatement.argument = t.nullLiteral();
        } else {
          returnStatement.argument = child.expression;
        }
      } else if (t.isJSXFragment(child)) {
        handleTopLevelFragment(child);
      }
    } else {
      const renderScopeId = t.jsxIdentifier(RENDER_SCOPE);
      returnStatement.argument = t.jsxElement(
        t.jsxOpeningElement(renderScopeId, []),
        t.jsxClosingElement(renderScopeId),
        jsx.children,
      );
    }
  };

  if (t.isJSXFragment(returnStatement.argument)) {
    handleTopLevelFragment(returnStatement.argument);
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
  };

  // This function will automatically populate the `dynamics` for us:
  transformJSX(
    options,
    {
      jsx: returnStatement.argument as t.JSXElement,
      jsxPath: jsxPath as NodePath<t.JSXElement>,
      componentBody,
      componentBodyPath,
      dynamics,
    },
    SHARED,
  );

  /**
   * The compiler splits the original Component into two, in order to conform to the runtime API:
   *
   * A puppet component, which holds a stateless and deterministic f(props) => JSX,
   * and creates the block from that function:
   *
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
  const masterComponentId = callSitePath.scope.generateUidIdentifier(
    t.isIdentifier(originalComponent.id)
      ? originalComponent.id.name
      : 'master$',
  );
  const puppetComponentId = callSitePath.scope.generateUidIdentifier('puppet$');

  const block = imports.addNamed('block');

  /**
   * ```js
   * const puppet = block(({ foo }) => {
   *  return ...
   * }, { shouldUpdate: (oldProps, newProps) => oldProps.foo !== newProps.foo })
   * ```
   */

  const params = t.isVariableDeclarator(Component)
    ? t.isArrowFunctionExpression(Component.init)
      ? Component.init.params
      : null
    : Component.params;

  // We want to add a __props property for the original call props
  // TODO: refactor this probably
  if (params?.length && t.isExpression(params[0])) {
    dynamics.data.push({
      id: t.identifier('__props'),
      value: params[0] as t.Expression,
    });
  }

  const holes = dynamics.data.map(({ id }) => id.name);
  const userOptions = callSite.arguments[1] as t.ObjectExpression | undefined;
  const compiledOptions = [
    t.objectProperty(
      t.identifier('svg'),
      // we try to automatically detect if the component is an SVG
      t.booleanLiteral(
        t.isJSXElement(returnStatement.argument) &&
          t.isJSXIdentifier(returnStatement.argument.openingElement.name) &&
          SVG_ELEMENTS.includes(
            returnStatement.argument.openingElement.name.name,
          ),
      ),
    ),
    t.objectProperty(
      t.identifier('original'),
      originalComponent.id as t.Identifier,
    ),
    t.objectProperty(t.identifier('shouldUpdate'), createDirtyChecker(holes)),
  ];

  if (userOptions) {
    compiledOptions.push(...(userOptions.properties as t.ObjectProperty[]));
  }

  const puppetBlock = t.callExpression(block, [
    t.arrowFunctionExpression(
      [
        t.objectPattern(
          dynamics.data.map(({ id }) => t.objectProperty(id, id)),
        ),
      ],
      t.blockStatement([returnStatement]),
    ),
    t.objectExpression(normalizeProperties(compiledOptions)),
  ]);

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

  const createElement = imports.addNamed(
    'createElement',
    isReact ? 'react' : 'preact',
  );
  const puppetCall = t.callExpression(createElement, [
    puppetComponentId,
    t.objectExpression(
      // Creates an object that passes expression values down
      dynamics.data.map(({ id, value }) => t.objectProperty(id, value || id)),
    ),
  ]);
  componentBody.body[statementsInBody - 1] = t.returnStatement(puppetCall);

  // We run these later to mutate the JSX
  for (let i = 0; i < dynamics.deferred.length; ++i) {
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
  Component.id = masterComponentId;
  callSitePath.replaceWith(
    dynamics.data.length ? masterComponentId : puppetComponentId,
  );

  // attach the original component to the master component
  globalPath.insertBefore(
    t.isVariableDeclarator(originalComponent)
      ? t.variableDeclaration('const', [originalComponent])
      : originalComponent,
  );
  // Try to set the display name to something meaningful
  globalPath.insertBefore(
    t.expressionStatement(
      t.assignmentExpression(
        '=',
        t.memberExpression(masterComponentId, t.identifier('displayName')),
        t.stringLiteral(masterComponentId.name),
      ),
    ),
  );
  globalPath.insertBefore(
    t.variableDeclaration('const', [
      t.variableDeclarator(puppetComponentId, puppetBlock),
    ]),
  );

  if (options.optimize) {
    const { variables, blockFactory } = optimize(
      options,
      {
        holes,
        jsx: returnStatement.argument as t.JSXElement,
      },
      SHARED,
    );

    globalPath.insertBefore(variables);
    puppetBlock.arguments[0] = t.nullLiteral();
    puppetBlock.arguments[1] = t.objectExpression([
      t.objectProperty(t.identifier('block'), blockFactory),
    ]);
  }
};

export const transformJSX = (
  options: Options,
  {
    jsx,
    jsxPath,
    componentBody,
    componentBodyPath,
    dynamics,
  }: {
    jsx: t.JSXElement;
    jsxPath: NodePath<t.JSXElement>;
    componentBody: t.BlockStatement;
    componentBodyPath: NodePath<t.Node>;
    dynamics: Dynamics;
  },
  SHARED: Shared,
) => {
  const { callSitePath, imports } = SHARED;

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
    callback: (() => void) | null,
  ) => {
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
    const id = identifier || componentBodyPath.scope.generateUidIdentifier('$');
    if (!dynamics.cache.has(id.name)) {
      dynamics.data.push({ value: expression, id });
      dynamics.cache.add(id.name);
    }
    // Sometimes, we require a mutation to the JSX. We defer this for later use.
    dynamics.deferred.push(callback!);
    return id;
  };

  const type = jsx.openingElement.name;

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

    const renderReactScope = imports.addNamed('renderReactScope');
    const nestedRender = t.callExpression(renderReactScope, [jsx]);

    const id = createDynamic(null, nestedRender, () => {
      jsxPath.replaceWith(
        t.isReturnStatement(jsxPath.parent)
          ? t.expressionStatement(id)
          : t.jsxExpressionContainer(id),
      );
    });

    return dynamics;
  }

  /**
   * Now, it's time to handle the DOM element case.
   */
  const { attributes } = jsx.openingElement;
  for (let i = 0, j = attributes.length; i < j; i++) {
    const attribute = attributes[i]!;

    if (t.isJSXSpreadAttribute(attribute)) {
      const spreadPath = jsxPath.get(`openingElement.attributes.${i}.argument`);
      throw createDeopt(
        'Spread attributes are not supported.',
        callSitePath,
        resolvePath(spreadPath),
      );
    }

    if (t.isJSXExpressionContainer(attribute.value)) {
      const attributeValue = attribute.value;
      if (t.isIdentifier(attributeValue.expression)) {
        createDynamic(attributeValue.expression, null, null);
      } else if (
        t.isLiteral(attributeValue.expression) &&
        !t.isTemplateElement(attributeValue.expression) // `${foo} test` will be a template literal
      ) {
        if (t.isStringLiteral(attributeValue.expression)) {
          attribute.value = attributeValue.expression;
        }
        // if other type of literal, do nothing
      } else {
        const id = createDynamic(
          null,
          attributeValue.expression as t.Expression,
          () => {
            attributeValue.expression = id;
          },
        );
      }
    }
  }

  for (let i = 0; i < jsx.children.length; i++) {
    const child = jsx.children[i]!;

    if (t.isJSXText(child)) continue;

    if (t.isJSXSpreadChild(child)) {
      const spreadPath = jsxPath.get(`children.${i}`);
      throw createDeopt(
        'Spread children are not supported.',
        callSitePath,
        resolvePath(spreadPath),
      );
    }

    if (t.isJSXFragment(child)) {
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
      const { expression } = child;

      if (t.isIdentifier(expression)) {
        createDynamic(expression, null, null);
        continue;
      }

      if (t.isJSXElement(expression)) {
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
          },
          SHARED,
        );
        jsx.children[i] = expression;
        continue;
      }

      if (t.isExpression(expression)) {
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
        if (
          t.isCallExpression(expression) &&
          t.isMemberExpression(expression.callee) &&
          t.isIdentifier(expression.callee.property, { name: 'map' })
        ) {
          const For = imports.addNamed('For');
          const jsxFor = t.jsxIdentifier(For.name);
          const newJsxArrayIterator = t.jsxElement(
            t.jsxOpeningElement(jsxFor, [
              t.jsxAttribute(
                t.jsxIdentifier('each'),
                t.jsxExpressionContainer(expression.callee.object),
              ),
            ]),
            t.jsxClosingElement(jsxFor),
            [t.jsxExpressionContainer(expression.arguments[0] as t.Expression)],
          );

          const expressionPath = jsxPath.get(`children.${i}.expression`);

          warn(
            'Array.map() will degrade performance. We recommend removing the block on the current component and using a <For /> component instead.',
            resolvePath(expressionPath),
            options.mute,
          );

          const renderReactScope = imports.addNamed('renderReactScope');

          const nestedRender = t.callExpression(renderReactScope, [
            newJsxArrayIterator,
          ]);

          const id = createDynamic(null, nestedRender, () => {
            jsx.children[i] = t.jsxExpressionContainer(id);
          });
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
          const expressionPath = jsxPath.get(`children.${i}.expression`);

          warn(
            'Conditional expressions will degrade performance. We recommend using deterministic returns instead.',
            resolvePath(expressionPath),
            options.mute,
          );

          const renderReactScope = imports.addNamed('renderReactScope');

          const id = createDynamic(
            null,
            t.callExpression(renderReactScope, [expression]),
            () => {
              jsx.children[i] = t.jsxExpressionContainer(id);
            },
          );
          continue;
        }

        const id = createDynamic(null, expression, () => {
          child.expression = id;
        });
      }

      continue;
    }

    const jsxChildPath = resolvePath(jsxPath.get(`children.${i}`));

    transformJSX(
      options,
      {
        jsx: child,
        jsxPath: jsxChildPath as NodePath<t.JSXElement>,
        componentBody,
        componentBodyPath,
        dynamics,
      },
      SHARED,
    );
  }
  return dynamics;
};
