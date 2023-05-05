import * as t from '@babel/types';
import { addNamed } from '@babel/helper-module-imports';
import type { NodePath } from '@babel/core';

export const transformReact =
  (options?: Record<string, any>) => (path: NodePath<t.CallExpression>) => {
    // TODO: allow aliasing (block as newBlock)
    if (t.isIdentifier(path.node.callee, { name: 'block' })) {
      // gets the binding for the "Component" in "block(Component)"
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

      if (
        (options?.mode === 'next' || options?.mode === 'react-server') &&
        importSource.source.value === 'million/react'
      ) {
        importSource.source.value = 'million/react-server';
      }

      // Get the name of the component
      const componentId = path.node.arguments[0] as t.Identifier;
      if (!t.isIdentifier(componentId)) {
        // eslint-disable-next-line no-console
        return console.warn(
          `Found unsupported argument for block. Make sure blocks consume the reference to a component function, not the direct declaration.`,
        );
      }
      const componentBinding = path.scope.getBinding(componentId.name);
      const component = structuredClone(componentBinding?.path.node);

      if (t.isFunctionDeclaration(component)) {
        handleComponent(
          path,
          component.body,
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
          component,
          importSource.source.value,
        );
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          `Found unsupported component declaration. Make sure blocks consume the reference to a component function.`,
        );
      }
    }
  };

const handleComponent = (
  path: NodePath<t.CallExpression>,
  componentFunction: object | null | undefined,
  component: any,
  sourceName: string,
) => {
  if (!t.isBlockStatement(componentFunction)) {
    // eslint-disable-next-line no-console
    return console.warn(
      'Expected a block statement for the component function. Make sure you are using a function declaration or arrow function.',
    );
  }

  const bodyLength = componentFunction.body.length;
  // Gets the returned JSX element
  for (let i = 0; i < bodyLength; ++i) {
    const node = componentFunction.body[i];
    if (!t.isIfStatement(node)) continue;
    if (
      t.isReturnStatement(node.consequent) ||
      (t.isBlockStatement(node.consequent) &&
        node.consequent.body.some((n) => t.isReturnStatement(n)))
    ) {
      throw new Error(
        'Early returns are not supported in blocks. Block components must be deterministic, meaning they return the same JSX element every time they are called.',
      );
    }
  }
  const view = componentFunction.body[bodyLength - 1];

  if (t.isReturnStatement(view) && t.isJSXElement(view.argument)) {
    const jsx = view.argument;
    const blockVariable = path.scope.generateUidIdentifier('block$');
    const componentVariable = path.scope.generateUidIdentifier('component$');

    // Extracts all expressions / identifiers from the JSX element
    const dynamics = getDynamicsFromJSX(path, jsx, sourceName);

    const forgettiCompatibleComponentName = t.identifier(
      `useBlock${componentVariable.name}`,
    );

    // Creates a new function that will be wrapped in block() instead
    const blockFunction = t.functionDeclaration(
      blockVariable,
      // Destructures props
      [t.objectPattern(dynamics.map(({ id }) => t.objectProperty(id, id)))],
      t.blockStatement([view]),
    );

    // Replaces the return statement with a call to the new block() function
    componentFunction.body[bodyLength - 1] = t.returnStatement(
      t.callExpression(forgettiCompatibleComponentName, [
        t.objectExpression(
          // Creates an object that passes expression values down
          dynamics.map(({ id, value }) => t.objectProperty(id, value || id)),
        ),
      ]),
    );

    // Swaps the names of the functions so that the component that wraps the
    // block is called instead
    const blockComponent = path.parentPath.node as any;
    const temp = blockComponent.id as t.Identifier;
    blockComponent.id = forgettiCompatibleComponentName;
    component.id = componentVariable;
    path.node.arguments[0] = blockVariable;

    const parentPath = path.parentPath.parentPath;
    parentPath?.insertBefore(t.variableDeclaration('const', [component]));
    parentPath?.insertBefore(blockFunction);
    parentPath?.insertBefore(
      t.variableDeclaration('const', [
        t.variableDeclarator(temp, component.id),
      ]),
    );

    path.scope.crawl();
  }
};

const getDynamicsFromJSX = (
  path: NodePath<t.Node>,
  jsx: t.JSXElement,
  sourceName: string,
  dynamics: { id: t.Identifier; value: t.Expression | null }[] = [],
) => {
  const { openingElement } = jsx;
  const { attributes } = openingElement;

  const createDynamic = (
    identifier: t.Identifier | null,
    expression: t.Expression | null,
  ) => {
    const id = identifier || path.scope.generateUidIdentifier('$');
    dynamics.push({ value: expression, id });
    return id;
  };

  const type = openingElement.name;
  if (t.isJSXIdentifier(type)) {
    const componentBinding = path.scope.getBinding(type.name);
    const component = componentBinding?.path.node;

    if (
      t.isFunctionDeclaration(component) ||
      t.isVariableDeclarator(component) ||
      type.name.startsWith(type.name[0]!.toUpperCase())
    ) {
      const createRoot = addNamed(
        path as any,
        'createRoot',
        'react-dom/client',
        {
          nameHint: 'createRoot$',
        },
      );
      const createElement = addNamed(path, 'createElement', 'react', {
        nameHint: 'createElement$',
      });

      const objectProperties: t.ObjectProperty[] = [];
      for (const attribute of openingElement.attributes) {
        if (
          t.isJSXAttribute(attribute) &&
          t.isJSXExpressionContainer(attribute.value)
        ) {
          const { expression } = attribute.value;
          const name = attribute.name;

          if (t.isIdentifier(expression)) {
            const id = createDynamic(expression, null);

            if (t.isJSXIdentifier(name)) {
              objectProperties.push(
                t.objectProperty(t.identifier(name.name), id),
              );
            }
          } else if (t.isExpression(expression)) {
            const id = createDynamic(null, expression);
            attribute.value.expression = id;
            if (t.isJSXIdentifier(name)) {
              objectProperties.push(
                t.objectProperty(t.identifier(name.name), id),
              );
            }
          }
        }

        if (t.isJSXSpreadAttribute(attribute)) {
          throw new Error('Spread attributes in JSX are not supported.');
        }
      }

      const nestedRender = t.arrowFunctionExpression(
        [t.identifier('el')],
        t.blockStatement([
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(
                t.callExpression(createRoot, [t.identifier('el')]),
                t.identifier('render'),
              ),
              [
                t.callExpression(createElement, [
                  t.identifier(type.name),
                  t.objectExpression(objectProperties),
                ]),
              ],
            ),
          ),
        ]),
      );

      const id = createDynamic(null, nestedRender);
      openingElement.name = t.jsxIdentifier(id.name);
    }
  }

  for (let i = 0, j = attributes.length; i < j; i++) {
    const attribute = attributes[i]!;

    if (
      t.isJSXAttribute(attribute) &&
      t.isJSXExpressionContainer(attribute.value)
    ) {
      const { expression } = attribute.value;

      if (t.isIdentifier(expression)) {
        createDynamic(expression, null);
      } else if (t.isExpression(expression)) {
        const id = createDynamic(null, expression);
        attribute.value.expression = id;
      }
    }

    if (t.isJSXSpreadAttribute(attribute)) {
      throw new Error('Spread attributes in JSX are not supported.');
    }
  }

  for (let i = 0, j = jsx.children.length; i < j; i++) {
    const child = jsx.children[i]!;

    if (t.isJSXExpressionContainer(child)) {
      const { expression } = child;
      if (t.isIdentifier(expression)) {
        createDynamic(expression, null);
      } else if (t.isJSXElement(expression)) {
        throw new Error(
          'JSX elements cannot be used as expressions. Please wrap them in a block.',
        );
      } else if (t.isExpression(expression)) {
        const id = createDynamic(null, expression);
        child.expression = id;
      }
    } else if (t.isJSXElement(child)) {
      getDynamicsFromJSX(path, child, sourceName, dynamics);
    }
  }
  return dynamics;
};
