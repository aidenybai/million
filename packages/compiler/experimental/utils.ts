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
