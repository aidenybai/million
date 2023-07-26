import { declare } from '@babel/helper-plugin-utils';
import { createUnplugin } from 'unplugin';
import { transformAsync } from '@babel/core';
import { visitor as legacyVdomVisitor } from './vdom';
import { callExpressionVisitor as reactCallExpressionVisitor } from './react';
import { jsxElementVisitor as reactJsxElementVisitor } from './react/jsx-element-visitor';
import { handleVisitorError } from './react/utils';
import type { NodePath, PluginItem } from '@babel/core';
import type * as t from '@babel/types';

export interface Options {
  optimize?: boolean;
  server?: boolean;
  mode?: 'react' | 'preact' | 'react-server' | 'preact-server' | 'vdom';
  mute?: boolean;
}

export const unplugin = createUnplugin((options: Options = {}) => {
  return {
    enforce: 'pre',
    name: 'million',
    transformInclude(id: string) {
      return /\.[jt]sx$/.test(id);
    },
    async transform(code: string, id: string) {
      const isTSX = id.endsWith('.tsx');

      const plugins = normalizePlugins([
        'babel-plugin-transform-react-createelement-to-jsx',
        '@babel/plugin-syntax-jsx',
        isTSX && [
          '@babel/plugin-syntax-typescript',
          { allExtensions: true, isTSX: true },
        ],
        [babelPlugin, options],
      ]);

      const result = await transformAsync(code, { plugins, filename: id });

      return result?.code ?? code;
    },
  };
});

export const babelPlugin = declare((api, options: Options) => {
  api.assertVersion(7);

  const blockCache = new Map<string, t.Identifier>();
  let callExpressionVisitor: ReturnType<typeof reactCallExpressionVisitor>;
  let jsxElementVisitor: ReturnType<typeof reactJsxElementVisitor> | undefined;

  // Backwards compatibility for `mode: 'react-server'`
  if (options.mode?.endsWith('-server')) {
    options.server = true;
    options.mode = options.mode.replace('-server', '') as 'react' | 'preact';
  }

  switch (options.mode) {
    case 'vdom':
      callExpressionVisitor = legacyVdomVisitor(options);
      break;
    case 'preact':
      callExpressionVisitor = reactCallExpressionVisitor(options, false);
      jsxElementVisitor = reactJsxElementVisitor(options, false);
      break;
    case 'react':
    default:
      callExpressionVisitor = reactCallExpressionVisitor(options, true);
      jsxElementVisitor = reactJsxElementVisitor(options, true);
      break;
  }

  return {
    name: 'million',
    visitor: {
      JSXElement(path: NodePath<t.JSXElement>) {
        handleVisitorError(() => {
          if (!jsxElementVisitor) return;
          jsxElementVisitor(path);
        }, options.mute);
      },
      CallExpression(path: NodePath<t.CallExpression>) {
        handleVisitorError(() => {
          callExpressionVisitor(path, blockCache);
        }, options.mute);
      },
    },
  };
});

export const normalizePlugins = (
  plugins: (PluginItem | false | undefined | null)[],
) => {
  return plugins.filter((plugin) => plugin) as PluginItem[];
};
