import type { NodePath } from '@babel/core';
import type * as t from '@babel/types';

export const findChild = <T>(
  path: NodePath,
  type: string,
  condition?: (node: NodePath<T>) => boolean
): NodePath<T> | null => {
  let child: NodePath<T> | null = null;
  path.traverse({
    [type]: (innerPath: NodePath) => {
      if (condition && !condition(innerPath as NodePath<T>)) return;
      child = innerPath as NodePath<T>;
      innerPath.stop();
    },
  });
  return child;
};

export const findChildMultiple = <T>(
  path: NodePath,
  type: string,
  condition?: (node: NodePath<T>) => boolean
): NodePath<T>[] => {
  const children: NodePath<T>[] = [];
  path.traverse({
    [type]: (innerPath: NodePath) => {
      if (condition && !condition(innerPath as NodePath<T>)) return;
      children.push(innerPath as NodePath<T>);
    },
  });
  return children;
};

export const findComment = (node: t.Node, comment: string) => {
  const comments = node.leadingComments;
  if (!comments) return null;
  for (let i = 0, j = comments.length; i < j; ++i) {
    if (comments[i]?.value.trim() === comment) {
      return comments[i];
    }
  }
};
