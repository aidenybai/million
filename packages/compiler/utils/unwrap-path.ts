import type * as t from '@babel/types';
import { isNestedExpression, isPathValid } from './checks';

type TypeFilter<V extends t.Node> = (node: t.Node) => node is V;

export function unwrapPath<V extends t.Node>(
  path: unknown,
  key: TypeFilter<V>,
): babel.NodePath<V> | undefined {
  if (isPathValid(path, key)) {
    return path;
  }
  if (isPathValid(path, isNestedExpression)) {
    return unwrapPath(path.get('expression'), key);
  }
  return undefined;
}
