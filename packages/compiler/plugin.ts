import { declare } from '@babel/helper-plugin-utils';
import { createUnplugin } from 'unplugin';
import { transformAsync } from '@babel/core';
import { visitor as legacyVdomVisitor } from './vdom';
import { visitor as reactVisitor } from './react';
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
        '@babel/plugin-syntax-jsx',
        // isTSX && [
        //   '@babel/plugin-syntax-typescript',
        //   { allExtensions: true, isTSX: true },
        // ],
        [babelPlugin, options],
      ]);

      const result = await transformAsync(code, { plugins });

      return result?.code ?? code;
    },
  };
});

export const babelPlugin = declare((api, options: Options) => {
  api.assertVersion(7);

  let visitor: (path: NodePath<t.CallExpression>) => void;

  // Backwards compatibility for `mode: 'react-server'`
  if (options.mode?.endsWith('-server')) {
    options.server = true;
    options.mode = options.mode.replace('-server', '') as 'react' | 'preact';
  }

  switch (options.mode) {
    case 'vdom':
      visitor = legacyVdomVisitor(options);
      break;
    case 'preact':
      visitor = reactVisitor(options, false);
      break;
    case 'react':
    default:
      visitor = reactVisitor(options, true);
      break;
  }

  return {
    name: 'million',
    visitor: {
      CallExpression(path: NodePath<t.CallExpression>) {
        try {
          visitor(path);
        } catch (err: unknown) {
          if (err instanceof Error && !options.mute) {
            // eslint-disable-next-line no-console
            console.warn(err.message, '\n');
          }
        }
      },
    },
  };
});

export const normalizePlugins = (
  plugins: (PluginItem | false | undefined | null)[],
) => {
  return plugins.filter((plugin) => plugin) as PluginItem[];
};
