import * as t from '@babel/types';
import { magenta } from 'kleur';
import type { NodePath } from '@babel/core';

export const createDeopt = (
  message: string | null,
  file: string,
  callSitePath: NodePath,
  path?: NodePath | null,
) => {
  const { parent, node } = callSitePath;
  if (
    t.isVariableDeclarator(parent) &&
    'arguments' in node &&
    t.isIdentifier(node.arguments[0])
  ) {
    parent.init = node.arguments[0];
  }
  if (message === null) return new Error('');
  return createError(message, path ?? callSitePath, file);
};

export const createError = (message: string, path: NodePath, file: string) => {
  return path.buildCodeFrameError(
    `\n${magenta('⚠')}${message} ${dim(styleLinks(message))}`,
  );
};
