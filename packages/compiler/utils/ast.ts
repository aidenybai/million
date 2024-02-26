import type { NodePath } from '@babel/core';
import type * as t from '@babel/types';
import { IGNORE_ANNOTATION } from '../constants';

export const findComment = (node: t.Node, comment: string) => {
  const comments = node.leadingComments;
  if (!comments) return null;
  for (let i = 0, j = comments.length; i < j; ++i) {
    if (comments[i]?.value.trim() === comment) {
      return comments[i];
    }
  }
};

export const shouldBeIgnored = (path: NodePath) => {
  for (const comment of path.node.leadingComments ?? []) {
    if (comment.value.includes(IGNORE_ANNOTATION)) {
      return true;
    }
  }
  if (path.parentPath) {
    return shouldBeIgnored(path.parentPath);
  }
  return false;
};
