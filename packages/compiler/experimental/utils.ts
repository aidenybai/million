import * as t from '@babel/types';

export const createEdit = ({
  type,
  name,
  value,
  hole,
  index,
  listener,
  patch,
  block,
}: {
  type: t.NumericLiteral;
  name?: t.StringLiteral;
  value?: t.Expression;
  hole?: t.Expression;
  index?: t.NumericLiteral;
  listener?: t.Expression;
  patch?: t.Expression;
  block?: t.Expression;
}) => {
  return t.objectExpression([
    t.objectProperty(t.identifier('t'), type),
    t.objectProperty(t.identifier('n'), name ?? t.nullLiteral()),
    t.objectProperty(t.identifier('v'), value ?? t.nullLiteral()),
    t.objectProperty(t.identifier('h'), hole ?? t.nullLiteral()),
    t.objectProperty(t.identifier('i'), index ?? t.nullLiteral()),
    t.objectProperty(t.identifier('l'), listener ?? t.nullLiteral()),
    t.objectProperty(t.identifier('p'), patch ?? t.nullLiteral()),
    t.objectProperty(t.identifier('b'), block ?? t.nullLiteral()),
  ]);
};

export const chainOrLogic = (
  ...binaryExpressions: t.BinaryExpression[]
): t.LogicalExpression | t.BinaryExpression | t.BooleanLiteral => {
  if (binaryExpressions.length === 0) return t.booleanLiteral(true);
  if (binaryExpressions.length === 1) return binaryExpressions[0]!;

  const [first, ...rest] = binaryExpressions;

  return t.logicalExpression('||', first!, chainOrLogic(...rest));
};

export const createDirtyChecker = (holes: string[]) => {
  const oldProps = t.identifier('a');
  const newProps = t.identifier('b');
  if (holes.length === 0) return null;
  return t.arrowFunctionExpression(
    [oldProps, newProps],
    chainOrLogic(
      ...holes.map((hole) => {
        const id = t.identifier(hole);
        return t.binaryExpression(
          '!==',
          t.optionalMemberExpression(oldProps, id, false, true),
          t.optionalMemberExpression(newProps, id, false, true),
        );
      }),
    ),
  );
};
