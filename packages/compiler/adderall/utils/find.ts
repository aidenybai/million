import type { NodePath } from '@babel/core';
import type * as t from '@babel/types';

export const findChild = <T>(
  path: NodePath<t.JSXElement>,
  type: string,
): NodePath<T> | null => {
  let child: NodePath<T> | null = null;
  path.traverse({
    [type]: (innerPath: NodePath) => {
      child = innerPath as NodePath<T>;
      innerPath.stop();
    },
  });
  return child;
};
