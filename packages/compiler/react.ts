import * as t from '@babel/types';
import { addNamed } from '@babel/helper-module-imports';
import type { NodePath } from '@babel/core';

export const RENDER_SCOPE = 'million-render-scope';

export const transformReact =
  (options: Record<string, any> = {}) =>
  (path: NodePath<t.CallExpression>) => {
    // TODO: allow aliasing (block as newBlock)
    if (t.isIdentifier(path.node.callee, { name: 'block' })) {
      // gets the binding for the "block()" in "block(Component)"
      const blockFunction = path.scope.getBinding(path.node.callee.name);
      if (!blockFunction) return;
      const importSource = blockFunction.path.parent;

      // Check if import is from million/react
      if (
        !t.isVariableDeclarator(path.parentPath.node) ||
        !t.isImportDeclaration(importSource) ||
        !importSource.source.value.includes('million')
      ) {
        return;
      }
      if (importSource.source.value === 'million') {
        importSource.source.value = 'million/react';
      }

      if (
        (options.mode === 'next' || options.mode === 'react-server') &&
        importSource.source.value === 'million/react'
      ) {
        importSource.source.value = 'million/react-server';
      }

      // Get the name of the component
      const componentId = path.node.arguments[0] as t.Identifier;
      if (!t.isIdentifier(componentId)) {
        throwCodeFrame({
          message:
            'Found unsupported argument for block. Make sure blocks consume the reference to a component function, not the direct declaration.',
          localPath: path,
          path,
        });
      }
      const componentBinding = path.scope.getBinding(componentId.name)!;
      const component = t.cloneNode(componentBinding.path.node);

      if (t.isFunctionDeclaration(component)) {
        handleComponent(
          path,
          component.body,
          componentBinding,
          component,
          importSource.source.value,
        );
      } else if (
        t.isVariableDeclarator(component) &&
        t.isArrowFunctionExpression(component.init)
      ) {
        handleComponent(
          path,
          component.init.body,
          componentBinding,
          component,
          importSource.source.value,
        );
      } else {
        throwCodeFrame({
          message:
            'You can only use block() with a function declaration or arrow function.',
          localPath: path,
          path,
        });
      }
    }
  };

const handleComponent = (
  path: NodePath<t.CallExpression>,
  componentFunction: object | null | undefined,
  componentBinding: any,
  component: any,
  sourceName: string,
) => {
  if (!t.isBlockStatement(componentFunction)) {
    return throwCodeFrame({
      message:
        'Expected a block statement for the component function. Make sure you are using a function declaration or arrow function.',
      localPath: path,
      path,
    });
  }

  const bodyLength = componentFunction.body.length;
  const correctSubPath = t.isVariableDeclarator(component)
    ? 'init.body.body'
    : 'body.body';

  // Gets the returned JSX element
  for (let i = 0; i < bodyLength; ++i) {
    const node = componentFunction.body[i];
    if (!t.isIfStatement(node)) continue;
    if (
      t.isReturnStatement(node.consequent) ||
      (t.isBlockStatement(node.consequent) &&
        node.consequent.body.some((n) => t.isReturnStatement(n)))
    ) {
      // // get if statement path from componentBinding.path
      const ifStatementPath = componentBinding.path.get(
        `${correctSubPath}.${i}.consequent`,
      );
      throwCodeFrame({
        message:
          'You cannot use multiple returns in blocks. There can only be one return statement at the end of the block.',
        path,
        localPath: ifStatementPath,
      });
    }
  }
  const view = componentFunction.body[bodyLength - 1];

  if (t.isReturnStatement(view) && t.isJSXElement(view.argument)) {
    const returnJsxPath = componentBinding.path.get(
      `${correctSubPath}.${bodyLength - 1}.argument`,
    );
    const jsx = view.argument;
    const blockVariable = path.scope.generateUidIdentifier('block$');
    const componentVariable = path.scope.generateUidIdentifier('component$');

    // Extracts all expressions / identifiers from the JSX element
    const dynamics = getDynamicsFromJSX(path, jsx, sourceName, returnJsxPath);

    const forgettiCompatibleComponentName = t.identifier(
      `useBlock${componentVariable.name}`,
    );

    // Creates a new function that will be wrapped in block() instead
    const blockFunction = t.functionDeclaration(
      blockVariable,
      // Destructures props
      [
        t.objectPattern(
          dynamics.data.map(({ id }) => t.objectProperty(id, id)),
        ),
      ],
      t.blockStatement([view]),
    );

    // Replaces the return statement with a call to the new block() function
    componentFunction.body[bodyLength - 1] = t.returnStatement(
      t.callExpression(forgettiCompatibleComponentName, [
        t.objectExpression(
          // Creates an object that passes expression values down
          dynamics.data.map(({ id, value }) =>
            t.objectProperty(id, value || id),
          ),
        ),
      ]),
    );

    for (let i = 0; i < dynamics.deferred.length; ++i) {
      dynamics.deferred[i]?.();
    }

    // Swaps the names of the functions so that the component that wraps the
    // block is called instead
    const blockComponent = path.parentPath.node as any;
    const temp = blockComponent.id as t.Identifier;
    blockComponent.id = forgettiCompatibleComponentName;
    component.id = componentVariable;
    path.node.arguments[0] = blockVariable;

    const parentPath = path.parentPath.parentPath;
    if (t.isFunctionDeclaration(component)) {
      parentPath?.insertBefore(component);
    } else {
      parentPath?.insertBefore(t.variableDeclaration('const', [component]));
    }
    parentPath?.insertBefore(blockFunction);
    parentPath?.insertBefore(
      t.variableDeclaration('const', [
        t.variableDeclarator(temp, component.id),
      ]),
    );
  }
};

const getDynamicsFromJSX = (
  path: NodePath<t.CallExpression>,
  jsx: t.JSXElement,
  sourceName: string,
  returnJsxPath: any,
  dynamics: {
    cache: Set<string>;
    data: {
      id: t.Identifier;
      value: t.Expression | null;
    }[];
    deferred: (() => void)[];
  } = { data: [], cache: new Set(), deferred: [] },
) => {
  const createDynamic = (
    identifier: t.Identifier | null,
    expression: t.Expression | null,
    callback: (() => void) | null,
  ) => {
    const id = identifier || path.scope.generateUidIdentifier('$');
    if (!dynamics.cache.has(id.name)) {
      dynamics.data.push({ value: expression, id });
      dynamics.cache.add(id.name);
    }
    dynamics.deferred.push(callback!);
    return id;
  };

  const type = jsx.openingElement.name;
  if (t.isJSXIdentifier(type)) {
    const componentBinding = path.scope.getBinding(type.name);
    const component = componentBinding?.path.node;

    if (
      t.isFunctionDeclaration(component) ||
      t.isVariableDeclarator(component) ||
      type.name.startsWith(type.name[0]!.toUpperCase())
    ) {
      const createElement = addNamed(path, 'createElement', 'react', {
        nameHint: 'createElement$',
      });

      const objectProperties: t.ObjectProperty[] = [];
      for (let i = 0, j = jsx.openingElement.attributes.length; i < j; i++) {
        const attribute = jsx.openingElement.attributes[i]!;

        if (
          t.isJSXAttribute(attribute) &&
          t.isJSXExpressionContainer(attribute.value)
        ) {
          const { expression } = attribute.value;
          const name = attribute.name;

          if (t.isIdentifier(expression)) {
            const id = createDynamic(expression, null, null);

            if (t.isJSXIdentifier(name)) {
              objectProperties.push(
                t.objectProperty(t.identifier(name.name), id),
              );
            }
          } else if (t.isExpression(expression)) {
            const id = createDynamic(null, expression, () => {
              // @ts-expect-error TypeScript doesn't know that this is a JSXAttribute even though it is.
              attribute.value.expression = id;
            });
            if (t.isJSXIdentifier(name)) {
              objectProperties.push(
                t.objectProperty(t.identifier(name.name), id),
              );
            }
          }
        }

        if (t.isJSXSpreadAttribute(attribute)) {
          const spreadPath = returnJsxPath.get(
            `openingElement.attributes.${i}.argument`,
          );
          throwCodeFrame({
            message: 'Spread attributes are not supported.',
            localPath: spreadPath,
            path,
          });
        }
      }

      throwCodeFrame({
        message:
          'Components will cause degraded performnace. Ideally, you should use DOM elements instead.',
        localPath: returnJsxPath,
        path: null,
      });

      const renderReactScope = addNamed(path, 'renderReactScope', sourceName, {
        nameHint: 'renderReactScope$',
      });

      const nestedRender = t.callExpression(renderReactScope, [
        t.callExpression(createElement, [
          t.identifier(type.name),
          t.objectExpression(objectProperties),
        ]),
      ]);

      const id = createDynamic(null, nestedRender, null);
      jsx.openingElement.name = t.jsxIdentifier(id.name);
      if (jsx.closingElement) {
        jsx.closingElement.name = t.jsxIdentifier(id.name);
      }
    }
  }

  for (let i = 0, j = jsx.openingElement.attributes.length; i < j; i++) {
    const attribute = jsx.openingElement.attributes[i]!;

    if (
      t.isJSXAttribute(attribute) &&
      t.isJSXExpressionContainer(attribute.value)
    ) {
      const { expression } = attribute.value;
      const { leadingComments } = expression;

      if (
        leadingComments?.length &&
        leadingComments[0]?.value.trim() === '@once'
      ) {
        continue;
      }

      if (t.isIdentifier(expression)) {
        createDynamic(expression, null, null);
      } else if (t.isExpression(expression)) {
        const id = createDynamic(null, expression, () => {
          // @ts-expect-error TypeScript doesn't know that this is a JSXAttribute even though it is.
          attribute.value.expression = id;
        });
      }
    }

    if (t.isJSXSpreadAttribute(attribute)) {
      const spreadPath = returnJsxPath.get(
        `openingElement.attributes.${i}.argument`,
      );

      throwCodeFrame({
        message: "Spread attributes aren't supported.",
        path,
        localPath: spreadPath,
      });
    }
  }

  for (let i = 0, j = jsx.children.length; i < j; i++) {
    const child = jsx.children[i]!;

    if (t.isJSXExpressionContainer(child)) {
      const { expression } = child;
      const { leadingComments } = expression;

      if (
        leadingComments?.length &&
        leadingComments[0]?.value.trim() === '@once'
      ) {
        continue;
      }

      if (t.isIdentifier(expression)) {
        createDynamic(expression, null, null);
      } else if (t.isJSXElement(expression)) {
        getDynamicsFromJSX(
          path,
          expression,
          sourceName,
          returnJsxPath.get(`children.${i}`),
          dynamics,
        );
        jsx.children[i] = expression;
      } else if (t.isExpression(expression)) {
        if (
          t.isCallExpression(expression) &&
          t.isMemberExpression(expression.callee) &&
          t.isIdentifier(expression.callee.property, { name: 'map' })
        ) {
          const For = addNamed(path, 'For', sourceName, {
            nameHint: 'For$',
          });
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

          const expressionPath = returnJsxPath.get(`children.${i}.expression`);

          throwCodeFrame({
            message:
              'Array.map() will degrade performance. We recommend removing the block on the current component and using a <For /> component instead.',
            localPath: expressionPath,
            path: null,
          });

          const renderReactScope = addNamed(
            path,
            'renderReactScope',
            sourceName,
            {
              nameHint: 'renderReactScope$',
            },
          );

          const nestedRender = t.callExpression(renderReactScope, [
            newJsxArrayIterator,
          ]);

          const id = createDynamic(null, nestedRender, () => {
            jsx.children[i] = t.jsxExpressionContainer(id);
          });
          continue;
        }

        if (
          t.isConditionalExpression(expression) ||
          t.isLogicalExpression(expression)
        ) {
          const expressionPath = returnJsxPath.get(`children.${i}.expression`);

          throwCodeFrame({
            message:
              'Conditional expressions will degrade performance. We recommend using deterministic returns instead.',
            localPath: expressionPath,
            path: null,
          });
          const renderReactScope = addNamed(
            path,
            'renderReactScope',
            sourceName,
            {
              nameHint: 'renderReactScope$',
            },
          );

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
    } else if (t.isJSXElement(child)) {
      getDynamicsFromJSX(
        path,
        child,
        sourceName,
        returnJsxPath.get(`children.${i}`),
        dynamics,
      );
    }
  }
  return dynamics;
};

const throwCodeFrame = ({
  message,
  localPath,
  path,
}: {
  message: string;
  localPath: NodePath;
  path: NodePath | null;
}) => {
  if (
    path?.parentPath &&
    t.isVariableDeclarator(path.parentPath.node) &&
    'arguments' in path.node &&
    t.isIdentifier(path.node.arguments[0])
  ) {
    path.parentPath.node.init = path.node.arguments[0];
  }
  const err = localPath.buildCodeFrameError(message);
  if (path) throw err;
  // eslint-disable-next-line no-console
  console.warn(err.message, '\n');
};
