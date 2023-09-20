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
  NO_PX_PROPERTIES,
  RENDER_SCOPE,
  TRANSFORM_ANNOTATION,
  isStatic,
  isJSXFragment,
  hasStyledAttributes,
  isSensitiveElement,
} from './utils';
import { optimize } from './optimize';
import { evaluate } from './evaluator';
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
    componentBodyPath: NodePath<t.BlockStatement>;
  },
  SHARED: Shared,
) => {
  const {
    isReact,
    file,
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
      file,
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
        file,
        callSitePath,
        resolvePath(ifStatementPath),
      );
    }
    // Checks if the last statement is a return statement
    if (statementsInBody === i - 1 && !t.isReturnStatement(node)) {
      throw createDeopt(
        'There must be a return statement at the end of the block.',
        file,
        callSitePath,
        resolvePath(componentBodyPath.get(`body.${i}`)),
      );
    }
  }

  const jsxPath = componentBodyPath
    .get('body')
    .find((path) => path.isReturnStatement())!;
  const returnStatement = jsxPath.node as t.ReturnStatement;

  /**
   * Turns top-level JSX fragments into a render scope. This is because
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
  const handleTopLevelFragment = (jsx: t.JSXFragment | t.JSXElement) => {
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
      } else if (isJSXFragment(child)) {
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

  if (isJSXFragment(returnStatement.argument)) {
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
    portalInfo: {
      index: -1,
      id: componentBodyPath.scope.generateUidIdentifier('portal'),
    },
  };

  if (!t.isJSXElement(returnStatement.argument)) {
    throw createDeopt(null, file, callSitePath);
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
  const unique = Math.random().toString(36).substring(2, 16);
  const masterComponentId = t.isIdentifier(originalComponent.id)
    ? originalComponent.id
    : t.identifier(`M${unique}`);
  const puppetComponentId = t.identifier(`P${unique}`);

  const block = imports.addNamed('block');

  const layers: t.JSXElement[] = extractLayers(
    options,
    {
      returnStatement,
      originalComponent,
      jsx: returnStatement.argument,
      jsxPath: jsxPath.get('argument') as NodePath<t.JSXElement>,
      layers: [],
    },
    SHARED,
  );

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
    },
    SHARED,
  );

  if (!dynamics.data.length && options.server) {
    throw createDeopt(null, file, callSitePath);
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
              returnStatement.argument.openingElement.name.name,
            )),
      ),
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

  const puppetBlock = t.callExpression(block, [
    puppetFn,
    t.objectExpression(normalizeProperties(compiledOptions)),
  ]);
  t.addComment(puppetBlock, 'leading', TRANSFORM_ANNOTATION);

  const data: (typeof dynamics)['data'] = [];

  if (dynamics.portalInfo.index !== -1) {
    const useState = imports.addNamed(
      'useState',
      isReact ? 'react' : 'preact/hooks',
    );
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
                ]),
              ),
            ]),
          ),
        ]),
        t.numericLiteral(0),
        true,
      ),
    });
  }

  for (const { id, value } of dynamics.data) {
    if (!value) continue;

    data.push({ id, value });
  }

  if (data.length) {
    jsxPath.insertBefore(
      t.variableDeclaration('const', [
        ...data.map(({ id, value }) => {
          return t.variableDeclarator(id, value);
        }),
      ]),
    );
  }

  const puppetJsxAttributes = dynamics.data.map(({ id }) =>
    t.jsxAttribute(t.jsxIdentifier(id.name), t.jsxExpressionContainer(id)),
  );

  if (options.hmr) {
    puppetJsxAttributes.push(
      t.jsxAttribute(
        t.jsxIdentifier('_hmr'),
        t.stringLiteral(String(Date.now())),
      ),
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
      true,
    ),
    null,
    [],
  );

  if (dynamics.portalInfo.index !== -1) {
    puppetCall = t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), [
      puppetCall,
      t.jsxExpressionContainer(
        t.callExpression(
          t.memberExpression(
            t.memberExpression(dynamics.portalInfo.id, t.identifier('$')),
            t.identifier('map'),
          ),
          [
            t.arrowFunctionExpression(
              [t.identifier('p')],
              t.memberExpression(t.identifier('p'), t.identifier('portal')),
            ),
          ],
        ),
      ),
    ]);
  }

  if (layers.length) {
    let parent: t.JSXElement | t.JSXFragment | undefined;
    let current: t.JSXElement | t.JSXFragment | undefined;
    for (let i = 0; i < layers.length; ++i) {
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
  SHARED: Shared,
): t.JSXElement[] => {
  const type = jsx.openingElement.name;
  if (
    (t.isJSXIdentifier(type) && isComponent(type.name)) ||
    t.isJSXMemberExpression(type)
  ) {
    trimJsxChildren(jsx);
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
        SHARED,
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
  SHARED: Shared,
) => {
  const { file, imports, unstable } = SHARED;

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
    )[],
  ) => {
    renderReactScope ??= imports.addNamed('renderReactScope');
    const index = ++dynamics.portalInfo.index;

    const refCurrent = t.memberExpression(
      dynamics.portalInfo.id,
      t.identifier('$'),
    );
    const nestedRender = t.callExpression(renderReactScope, [
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
    // TODO: Add a warning for using components that are not block or For
    // warn(
    //   'Components will cause degraded performance. Ideally, you should use DOM elements instead.',
    //   jsxPath,
    //   options.mute,
    // );

    const id = createPortal(() => {
      jsxPath.replaceWith(
        isRoot ? t.expressionStatement(id!) : t.jsxExpressionContainer(id!),
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
        isRoot ? t.expressionStatement(id!) : t.jsxExpressionContainer(id!),
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
      const spreadPath = jsxPath.get(`openingElement.attributes.${i}.argument`);
      warn(
        'Spread attributes are not fully supported.',
        file,
        resolvePath(spreadPath),
      );

      const id = createPortal(() => {
        jsxPath.replaceWith(
          isRoot ? t.expressionStatement(id!) : t.jsxExpressionContainer(id!),
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
            throw createDeopt(
              'Computed properties are not supported in style objects.',
              file,
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
              .join(';'),
          );
        });
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

      if (t.isJSXIdentifier(attribute.name) && hasStyledAttributes(attribute)) {
        const id = createPortal(() => {
          jsxPath.replaceWith(
            isRoot ? t.expressionStatement(id!) : t.jsxExpressionContainer(id!),
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
                : t.jsxExpressionContainer(id!),
            );
          }, [jsx, t.booleanLiteral(unstable)]);

          return dynamics;
        }
        createDynamic(expression, null, null, null);
      } else if (isStatic(expression)) {
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

    if (t.isJSXText(child)) continue;

    if (t.isJSXSpreadChild(child)) {
      const spreadPath = jsxPath.get(`children.${i}`);
      warn(
        'Spread children are not fully supported.',
        file,
        resolvePath(spreadPath),
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
            SHARED,
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
        const expressionPath = resolvePath(
          jsxPath.get(`children.${i}.expression`),
        );
        const hasSensitive =
          expressionPath.parentPath?.isJSXExpressionContainer() &&
          t.isJSXElement(expressionPath.parentPath.parent) &&
          isSensitiveElement(expressionPath.parentPath.parent);

        if (
          t.isCallExpression(expression) &&
          t.isMemberExpression(expression.callee) &&
          t.isIdentifier(expression.callee.property, { name: 'map' }) &&
          !hasSensitive
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
            resolvePath(expressionPath),
            options.mute,
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
                  : t.jsxExpressionContainer(id!),
              );
            }
            jsx.children[i] = t.jsxExpressionContainer(id!);
          }, [hasSensitive ? jsx : expression, t.booleanLiteral(unstable)]);

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
      },
      SHARED,
    );
  }
  return dynamics;
};
