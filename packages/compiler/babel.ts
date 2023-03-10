import * as t from '@babel/types';
import type * as babel from '@babel/core';

const chainLogicalExpressions = (
  ...binaryExpressions: t.BinaryExpression[]
): t.LogicalExpression | t.BinaryExpression => {
  if (binaryExpressions.length === 1) {
    return binaryExpressions[0]!;
  }

  const [first, ...rest] = binaryExpressions;

  return t.logicalExpression(
    '||',
    first as t.BinaryExpression,
    chainLogicalExpressions(...rest),
  );
};

export const plugin = (): babel.pluginObj => {
  return {
    name: 'million',
    visitor: {
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee, { name: 'block' })) {
          const blockFunction = path.scope.getBinding(path.node.callee.name);
          if (
            blockFunction.path.parent.type !== 'ImportDeclaration' ||
            !blockFunction.path.parent.source.includes('million')
          ) {
            return;
          }

          const [component, shouldUpdate] = path.node.arguments;
          const componentFunction = path.scope.getBinding(component.name);
          const componentArguments = componentFunction?.path.node.params;

          if (!shouldUpdate && componentArguments?.length) {
            const [{ properties }] = componentArguments;

            path.node.arguments[1] = t.arrowFunctionExpression(
              componentArguments,
              chainLogicalExpressions(
                ...properties.map((property) => {
                  return t.binaryExpression(
                    '!==',
                    t.memberExpression(
                      t.identifier('oldProps'),
                      t.identifier(property.key.name),
                    ),
                    t.memberExpression(
                      t.identifier('newProps'),
                      t.identifier(property.key.name),
                    ),
                  );
                }),
              ),
            );
          }
        }
      },
    },
  };
};
