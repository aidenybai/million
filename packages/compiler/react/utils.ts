import * as t from '@babel/types';
import type { NodePath } from '@babel/core';
import type { Options } from '../plugin';

export const resolveCorrectImportSource = (
  options: Options,
  source: string,
) => {
  if (!source.startsWith('million')) return source;
  const mode = options.mode || 'react';
  if (options.server) {
    return `million/${mode}-server`;
  }
  return `million/${mode}`;
};

export const createError = (message: string, path: NodePath) => {
  return path.buildCodeFrameError(`[Million.js] ${message}`);
};

export const warn = (message: string, path: NodePath) => {
  const err = createError(message, path);
  // eslint-disable-next-line no-console
  console.warn(
    err.message,
    '\n',
    'You may want to reference the Rules of Blocks (https://million.dev/docs/rules)',
    '\n',
  );
};

export const createDeopt = (
  message: string,
  callSitePath: NodePath,
  path?: NodePath,
) => {
  const { parent, node } = callSitePath;
  if (
    t.isVariableDeclarator(parent) &&
    'arguments' in node &&
    t.isIdentifier(node.arguments[0])
  ) {
    parent.init = node.arguments[0];
  }
  return createError(message, path ?? callSitePath);
};

export const resolvePath = (path: NodePath | NodePath[]): NodePath => {
  return Array.isArray(path) ? path[0]! : path;
};

export const isComponent = (name: string) => {
  return name.startsWith(name[0]!.toUpperCase());
};
