import * as t from '@babel/types';
import type { NodePath } from '@babel/core';

export const optimizeReact = (path: NodePath<t.CallExpression>) => {
  // TODO: allow aliasing (block as newBlock)
  if (t.isIdentifier(path.node.callee, { name: 'block' })) {
    const blockFunction = path.scope.getBinding(path.node.callee.name);
    if (!blockFunction) return;
    const importSource = blockFunction.path.parent;

    if (
      !t.isVariableDeclarator(path.parentPath.node) ||
      !t.isImportDeclaration(importSource) ||
      // Currently uses includes. Fix this because million/react could be included
      !importSource.source.value.includes('million')
    ) {
      return;
    }

    const componentId = path.node.arguments[0] as t.Identifier;
    if (!t.isIdentifier(componentId)) return;
    const componentBinding = path.scope.getBinding(componentId.name);
    const component = componentBinding?.path.node;

    if (t.isFunctionDeclaration(component)) {
      // TODO
    } else if (
      t.isVariableDeclarator(component) &&
      t.isArrowFunctionExpression(component.init)
    ) {
      const componentFunction = component.init.body;
      if (t.isBlockStatement(componentFunction)) {
        const bodyLength = componentFunction.body.length;
        const view = componentFunction.body[bodyLength - 1];

        if (t.isReturnStatement(view) && t.isJSXElement(view.argument)) {
          const jsx = view.argument;
          const ids: (
            | t.Identifier
            | { value: t.ArrowFunctionExpression; id: t.Identifier }
          )[] = [];
          // eslint-disable-next-line prefer-const
          let count = 0; // used downstream (refactor this)

          getIdentifiersFromJSX(jsx, ids, count);

          const blockVariable = path.scope.generateUidIdentifier('block$');
          const properties = ids.map((id) => {
            if (t.isIdentifier(id)) return t.objectProperty(id, id);
            return t.objectProperty(id.id, id.value);
          });
          const pattern = ids.map((id) => {
            if (t.isIdentifier(id)) return t.objectProperty(id, id);
            return t.objectProperty(id.id, id.id);
          });
          const blockFunction = t.functionDeclaration(
            blockVariable,
            [t.objectPattern(pattern)],
            t.blockStatement([view]),
          );

          componentFunction.body[bodyLength - 1] = t.returnStatement(
            t.callExpression(blockVariable, [t.objectExpression(properties)]),
          );

          const tempBlockComponentId = path.parentPath.node.id;
          path.parentPath.node.id = component.id;
          component.id = tempBlockComponentId;
          path.node.arguments[0] = blockVariable;

          path.parentPath.parentPath?.insertBefore(blockFunction);
        }
      }
    }
  }
};

const getIdentifiersFromJSX = (
  jsx: t.JSXElement,
  ids: (
    | t.Identifier
    | { value: t.ArrowFunctionExpression; id: t.Identifier }
  )[],
  count: number,
) => {
  const { openingElement } = jsx;
  const { attributes } = openingElement;

  for (let i = 0, j = attributes.length; i < j; i++) {
    const attribute = attributes[i]!;

    if (
      t.isJSXAttribute(attribute) &&
      t.isJSXExpressionContainer(attribute.value)
    ) {
      const { expression } = attribute.value;
      if (t.isIdentifier(expression)) {
        ids.push(expression);
      } else if (t.isArrowFunctionExpression(expression)) {
        const id = t.identifier(`_prop${count}$`);
        ids.push({ value: expression, id });
        count++;
        attribute.value.expression = id;
      }
    }
  }

  for (let i = 0, j = jsx.children.length; i < j; i++) {
    const child = jsx.children[i]!;

    if (t.isJSXExpressionContainer(child)) {
      const { expression } = child;
      if (t.isIdentifier(expression)) {
        ids.push(expression);
      }
    } else if (t.isJSXElement(child)) {
      getIdentifiersFromJSX(child, ids, count);
    }
  }
};
