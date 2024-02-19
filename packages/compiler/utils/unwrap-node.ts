import type * as t from '@babel/types';
import { isNestedExpression } from './checks';

type TypeCheck<K> = K extends ((node: t.Node) => node is infer U extends t.Node)
  ? U
  : never;

type TypeFilter = (node: t.Node) => boolean;

export function unwrapNode<K extends TypeFilter>(
  node: t.Node,
  key: K,
): TypeCheck<K> | undefined {
  if (key(node)) {
    return node as TypeCheck<K>;
  }
  if (isNestedExpression(node)) {
    return unwrapNode(node.expression, key);
  }
  return undefined;
}
