import * as t from '@babel/types';
import { createDirtyChecker } from '../experimental/utils';
import {
  createDeopt,
  resolvePath,
  warn,
  isComponent,
  trimJsxChildren,
  normalizeProperties,
  SVG_ELEMENTS,
  RENDER_SCOPE,
  TRANSFORM_ANNOTATION,
  handleVisitorError,
} from './utils';
import { optimize } from './optimize';
import { evaluate } from './evaluator';
import { jsxElementVisitor } from './jsx-element-visitor';
import type { Options } from '../plugin';
import type { Dynamics, Shared } from './types';
import type { Analytics } from '../../types';
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
    callSite,
    callSitePath,
    Component,
    RawComponent,
    blockCache,
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

  const jsxPath = componentBodyPath.get('body').find(t.isReturnStatement)!;
  const returnStatement = jsxPath.node as t.ReturnStatement;

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
    trimJsxChildren(jsx);
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
    unoptimizable: false,
  };

  const analytics: Analytics = {
    elements: 0,
    components: 0,
    attributes: 0,
    data: 0,
    traversals: 0,
  };

  if (!t.isJSXElement(returnStatement.argument)) {
    throw createDeopt(null, callSitePath);
  }

  // This function will automatically populate the `dynamics` for us:
  transformJSX(
    options,
    {
      jsx: returnStatement.argument,
      jsxPath: jsxPath.get('argument') as NodePath<t.JSXElement>,
      componentBody,
      componentBodyPath,
      dynamics,
      isRoot: true,
      analytics,
    },
    SHARED,
  );

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
  const masterComponentId = callSitePath.scope.generateUidIdentifier(
    t.isIdentifier(originalComponent.id)
      ? originalComponent.id.name
      : 'master$',
  );
  const puppetComponentId = callSitePath.scope.generateUidIdentifier('puppet$');
  const isCallable = statementsInBody === 1;

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
  if (
    options.server &&
    params?.length &&
    (t.isIdentifier(params[0]) || t.isObjectPattern(params[0]))
  ) {
    // turn params[0] object pattern into an object expression
    const props = t.isObjectPattern(params[0])
      ? t.objectExpression(
          params[0].properties.map((prop) => {
            const key = (prop as t.ObjectProperty).key;
            return t.objectProperty(key, key as t.Expression);
          }),
        )
      : params[0];

    dynamics.data.push({
      id: t.identifier('__props'),
      value: props,
    });
  }

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
              returnStatement.argument.openingElement.name.name,
            )),
      ),
    ),
    t.objectProperty(
      t.identifier('original'),
      options.server ? (originalComponent.id as t.Identifier) : t.nullLiteral(),
    ),
    t.objectProperty(
      t.identifier('analytics'),
      t.isArrowFunctionExpression(originalOptions.analytics)
        ? t.callExpression(originalOptions.analytics, [
            t.objectExpression(
              Object.entries(analytics).map(([key, value]) =>
                t.objectProperty(t.identifier(key), t.numericLiteral(value)),
              ),
            ),
          ])
        : t.nullLiteral(),
    ),
    t.objectProperty(t.identifier('shouldUpdate'), createDirtyChecker(holes)),
  ];

  const puppetFn = t.arrowFunctionExpression(
    [
      t.objectPattern(
        dynamics.data.map(({ id }) => t.objectProperty(id, id, false, true)),
      ),
    ],
    t.blockStatement([returnStatement]),
  );

  const puppetBlock = dynamics.unoptimizable
    ? puppetFn
    : t.callExpression(block, [
        puppetFn,
        t.objectExpression(normalizeProperties(compiledOptions)),
      ]);
  t.addComment(puppetBlock, 'leading', TRANSFORM_ANNOTATION);

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

  const data: (typeof dynamics)['data'] = [];

  for (const { id, value } of dynamics.data) {
    if (!value) continue;

    data.push({ id, value });
  }

  if (data.length) {
    jsxPath.insertBefore(
      t.variableDeclaration(
        'const',
        data.map(({ id, value }) => {
          return t.variableDeclarator(id, value);
        }),
      ),
    );
  }

  const puppetCall = t.jsxElement(
    t.jsxOpeningElement(
      t.jsxIdentifier(puppetComponentId.name),
      dynamics.data.map(({ id }) =>
        t.jsxAttribute(t.jsxIdentifier(id.name), t.jsxExpressionContainer(id)),
      ),
      true,
    ),
    null,
    [],
  );

  componentBody.body[data.length ? statementsInBody : statementsInBody - 1] =
    t.returnStatement(puppetCall);

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

  callSitePath.replaceWith(masterComponentId);

  if (options.server) {
    // attach the original component to the master component
    globalPath.insertBefore(
      t.isVariableDeclarator(originalComponent)
        ? t.variableDeclaration('const', [originalComponent])
        : originalComponent,
    );
  }
  globalPath.insertBefore(
    t.variableDeclaration('const', [
      t.variableDeclarator(puppetComponentId, puppetBlock),
    ]),
  );

  if (isCallable) {
    globalPath.insertBefore(
      t.expressionStatement(
        t.assignmentExpression(
          '=',
          t.memberExpression(masterComponentId, t.identifier('callable')),
          t.booleanLiteral(true),
        ),
      ),
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
      SHARED,
    );

    globalPath.insertBefore(variables);

    const puppetBlockArguments = (puppetBlock as t.CallExpression).arguments;

    puppetBlockArguments[0] = t.nullLiteral();
    puppetBlockArguments[1] = t.objectExpression([
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
    isRoot,
    analytics,
  }: {
    jsx: t.JSXElement;
    jsxPath: NodePath<t.JSXElement>;
    componentBody: t.BlockStatement;
    componentBodyPath: NodePath<t.Node>;
    dynamics: Dynamics;
    isRoot: boolean;
    analytics: Analytics;
  },
  SHARED: Shared,
) => {
  const { imports, unstable, isReact } = SHARED;

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
    callback: (() => void) | null,
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
    const id = identifier || componentBodyPath.scope.generateUidIdentifier('$');

    if (!dynamics.cache.has(id.name)) {
      dynamics.data.push({ value: expression, id });
      dynamics.cache.add(id.name);
    }
    // Sometimes, we require a mutation to the JSX. We defer this for later use.
    dynamics.deferred.push(callback!);
    analytics.data++;
    return id;
  };

  const type = jsx.openingElement.name;

  // if (!t.isJSXElement(jsx) && !t.isJSXFragment(jsx) && isRoot) {
  //   throw createDeopt(null, callSitePath);
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
    if (type.name === 'For') {
      const visitor = jsxElementVisitor(options, isReact);

      const { attributes } = jsx.openingElement;
      for (let i = 0, j = attributes.length; i < j; i++) {
        const attribute = attributes[i]!;
        analytics.attributes++;

        if (t.isJSXSpreadAttribute(attribute)) {
          const spreadPath = jsxPath.get(
            `openingElement.attributes.${i}.argument`,
          );
          warn(
            'Spread attributes are not fully supported.',
            resolvePath(spreadPath),
          );
          continue;
        }

        if (t.isJSXExpressionContainer(attribute.value)) {
          const attributeValue = attribute.value;
          const expressionPath = jsxPath.get(
            `openingElement.attributes.${i}.value.expression`,
          );
          const { ast: expression, err } = evaluate(
            attributeValue.expression,
            resolvePath(expressionPath).scope,
          );

          if (!err) attributeValue.expression = expression;

          if (t.isIdentifier(expression)) {
            if (attribute.name.name === 'ref') {
              const renderReactScope = imports.addNamed('renderReactScope');
              const nestedRender = t.callExpression(renderReactScope, [
                jsx,
                t.booleanLiteral(unstable),
              ]);
              const id = createDynamic(null, nestedRender, null, () => {
                jsxPath.replaceWith(t.jsxExpressionContainer(id!));
              });
              return dynamics;
            }
            createDynamic(expression, null, null, null);
          } else if (
            t.isLiteral(expression) &&
            !t.isTemplateLiteral(expression) // `${foo} test` will be a template literal
          ) {
            if (t.isStringLiteral(expression)) {
              attribute.value = expression;
            }
            // if other type of literal, do nothing
          } else {
            const id = createDynamic(
              null,
              expression as t.Expression,
              resolvePath(expressionPath),
              () => {
                if (id) attributeValue.expression = id;
              },
            );
          }
        }
      }
      handleVisitorError(() => visitor(jsxPath), options.mute);
      jsxPath.scope.crawl();
    }

    analytics.components++;
    // TODO: Add a warning for using components that are not block or For
    // warn(
    //   'Components will cause degraded performance. Ideally, you should use DOM elements instead.',
    //   jsxPath,
    //   options.mute,
    // );

    const renderReactScope = imports.addNamed('renderReactScope');
    const nestedRender = t.callExpression(renderReactScope, [
      jsx,
      type.name === 'For'
        ? t.booleanLiteral(false)
        : t.booleanLiteral(unstable),
    ]);
    const id = createDynamic(null, nestedRender, null, () => {
      jsxPath.replaceWith(
        isRoot ? t.expressionStatement(id!) : t.jsxExpressionContainer(id!),
      );
    });

    return dynamics;
  }

  analytics.elements++;

  /**
   * Now, it's time to handle the DOM element case.
   */
  const { attributes } = jsx.openingElement;
  for (let i = 0, j = attributes.length; i < j; i++) {
    const attribute = attributes[i]!;
    analytics.attributes++;

    if (t.isJSXSpreadAttribute(attribute)) {
      const spreadPath = jsxPath.get(`openingElement.attributes.${i}.argument`);
      warn(
        'Spread attributes are not fully supported.',
        resolvePath(spreadPath),
      );
      continue;
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
            throw createDeopt(
              'Computed properties are not supported in style objects.',
              jsxPath,
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

          if (t.isIdentifier(value)) {
            createDynamic(value, null, null, null);
            hasDynamic = true;
          } else if (t.isLiteral(value) && !t.isTemplateLiteral(value)) {
            if (t.isStringLiteral(value)) {
              property.value = value;
            }
          } else {
            const expressionPath = jsxPath.get(
              `openingElement.attributes.${i}.value.expression.properties.${l}.value`,
            );

            const id = createDynamic(
              null,
              value as t.Expression,
              resolvePath(expressionPath),
              () => {
                if (id) property.value = id;
              },
            );
            hasDynamic = true;
          }
        } else {
          hasDynamic = true;
        }
      }
      if (!hasDynamic) {
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
            .join('; '),
        );
      }
      continue;
    }

    if (t.isJSXExpressionContainer(attribute.value)) {
      const attributeValue = attribute.value;
      const expressionPath = jsxPath.get(
        `openingElement.attributes.${i}.value.expression`,
      );
      const { ast: expression, err } = evaluate(
        attributeValue.expression,
        resolvePath(expressionPath).scope,
      );

      if (!err) attributeValue.expression = expression;

      if (t.isIdentifier(expression)) {
        if (attribute.name.name === 'ref') {
          const renderReactScope = imports.addNamed('renderReactScope');
          const nestedRender = t.callExpression(renderReactScope, [
            jsx,
            t.booleanLiteral(unstable),
          ]);
          const id = createDynamic(null, nestedRender, null, () => {
            jsxPath.replaceWith(t.jsxExpressionContainer(id!));
          });
          return dynamics;
        }
        createDynamic(expression, null, null, null);
      } else if (
        t.isLiteral(expression) &&
        !t.isTemplateLiteral(expression) // `${foo} test` will be a template literal
      ) {
        if (t.isStringLiteral(expression)) {
          attribute.value = expression;
        }
        // if other type of literal, do nothing
      } else {
        const id = createDynamic(
          null,
          expression as t.Expression,
          resolvePath(expressionPath),
          () => {
            if (id) attributeValue.expression = id;
          },
        );
      }
    }
  }

  for (let i = 0; i < jsx.children.length; i++) {
    const child = jsx.children[i]!;

    analytics.traversals++;

    if (t.isJSXText(child)) continue;

    if (t.isJSXSpreadChild(child)) {
      const spreadPath = jsxPath.get(`children.${i}`);
      warn('Spread children are not fully supported.', resolvePath(spreadPath));
      continue;
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
      const expressionPath = jsxPath.get(`children.${i}.expression`);
      const { ast: expression, err } = evaluate(
        child.expression,
        resolvePath(expressionPath).scope,
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
            analytics,
          },
          SHARED,
        );
        jsx.children[i] = expression;
        continue;
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
            t.booleanLiteral(unstable),
          ]);

          const id = createDynamic(null, nestedRender, null, () => {
            jsx.children[i] = t.jsxExpressionContainer(id!);
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
            t.callExpression(renderReactScope, [
              expression,
              t.booleanLiteral(unstable),
            ]),
            null,
            () => {
              jsx.children[i] = t.jsxExpressionContainer(id!);
            },
          );
          continue;
        }

        const id = createDynamic(
          null,
          expression,
          resolvePath(expressionPath),
          () => {
            if (id) child.expression = id;
          },
        );
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
        isRoot: false,
        analytics,
      },
      SHARED,
    );
  }
  return dynamics;
};
