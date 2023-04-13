import * as t from '@babel/types';
import type { NodePath } from '@babel/core';

export const transformReact = (path: NodePath<t.CallExpression>) => {
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

    // Get the name of the component
    const componentId = path.node.arguments[0] as t.Identifier;
    if (!t.isIdentifier(componentId)) {
      // eslint-disable-next-line no-console
      return console.warn(
        `Found unsupported argument for block. Make sure blocks consume the reference to a component function, not the direct declaration.`,
      );
    }
    const componentBinding = path.scope.getBinding(componentId.name);
    const component = componentBinding?.path.node;

    if (t.isFunctionDeclaration(component)) {
      handleComponent(path, component.body, component);
    } else if (
      t.isVariableDeclarator(component) &&
      t.isArrowFunctionExpression(component.init)
    ) {
      handleComponent(path, component.init.body, component);
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
    // Extracts all expressions / identifiers from the JSX element
    const dynamics = getDynamicsFromJSX(path, jsx);
    const blockVariable = path.scope.generateUidIdentifier('block$');
    const forgettiCompatibleComponentName = t.identifier(
      `use${String(component.id.name)}`,
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
    const temp = blockComponent.id;
    blockComponent.id = forgettiCompatibleComponentName;
    component.id = temp;
    path.node.arguments[0] = blockVariable;

    path.parentPath.parentPath?.insertBefore(blockFunction);
  }
};

const getDynamicsFromJSX = (
  path: NodePath<t.CallExpression>,
  jsx: t.JSXElement,
  dynamics: { id: t.Identifier; value: t.Expression | null }[] = [],
  count = 0,
) => {
  const { openingElement } = jsx;
  const { attributes } = openingElement;

  const createDynamic = (
    identifier: t.Identifier | null,
    expression: t.Expression | null,
  ) => {
    // We need to create identifiers for expressions
    const id = identifier || t.identifier(`__${count}`);
    dynamics.push({ value: expression, id });
    count++;
    return id;
  };

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
      getDynamicsFromJSX(path, child, dynamics, count);
    }
  }
  return dynamics;
};
