import * as t from '@babel/types';

export const chainOrLogic = (
  ...binaryExpressions: t.BinaryExpression[]
): t.LogicalExpression | t.BinaryExpression => {
  if (binaryExpressions.length === 1) {
    return binaryExpressions[0]!;
  }

  const [first, ...rest] = binaryExpressions;

  return t.logicalExpression(
    '||',
    first!,
    chainOrLogic(...rest),
  );
};
