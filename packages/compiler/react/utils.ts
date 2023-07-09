import * as t from '@babel/types';
import type { NodePath } from '@babel/core';
import type { Options } from '../plugin';

export const RENDER_SCOPE = 'slot';

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

export const warn = (message: string, path: NodePath, mute?: boolean) => {
  if (mute) return;
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

export const trimFragmentChildren = (jsx: t.JSXFragment) => {
  for (let i = jsx.children.length - 1; i >= 0; i--) {
    const child = jsx.children[i]!;
    if (t.isJSXText(child) && child.value.trim() === '') {
      jsx.children.splice(i, 1);
    }
  }
};

export const normalizeProperties = (properties: t.ObjectProperty[]) => {
  const seen = new Set<string>();
  for (let i = properties.length - 1; i >= 0; i--) {
    if (!properties[i]) {
      properties.splice(i, 1);
      continue;
    }
    const prop = properties[i]!;
    if (
      t.isObjectProperty(prop) &&
      t.isIdentifier(prop.key) &&
      seen.has(prop.key.name)
    ) {
      properties.splice(i, 1);
    }
    if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
      seen.add(prop.key.name);
    }
  }
  return properties;
};

export const SVG_ELEMENTS = [
  'circle',
  'ellipse',
  'foreignObject',
  'image',
  'line',
  'path',
  'polygon',
  'polyline',
  'rect',
  'text',
  'textPath',
  'tspan',
  'svg',
  'g',
];
