import type * as t from '@babel/types';

export const findComment = (node: t.Node, comment: string) => {
  const comments = node.leadingComments;
  if (!comments) return null;
  for (let i = 0, j = comments.length; i < j; ++i) {
    if (comments[i]?.value.trim() === comment) {
      return comments[i];
    }
  }
};
