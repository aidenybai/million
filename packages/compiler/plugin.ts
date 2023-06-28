import { readFileSync } from 'fs';
import { glob } from 'glob';
import { declare } from '@babel/helper-plugin-utils';
import { createUnplugin } from 'unplugin';
import { transformAsync } from '@babel/core';
import { visitor as legacyVdomVisitor } from './vdom';
import { visitor as reactVisitor } from './react';
import type { NodePath, PluginItem } from '@babel/core';
import * as t from '@babel/types';

export interface Options {
  include?: string | string[];
  auto?: string[];
  optimize?: boolean;
  server?: boolean;
  mode?: 'react' | 'preact' | 'react-server' | 'preact-server' | 'vdom';
  mute?: boolean;
  id?: string;
}

const index = new Map<string, string>();
export const getIndex = (id: string) => index.get(id);

export const unplugin = createUnplugin((options: Options = {}) => {
  return {
    enforce: 'pre',
    name: 'million',
    async buildStart() {
      if (!options.include) {
        (this as any).warn(
          'You should specify `include` option in your compiler config for the files you want to transform. See https://million.dev/docs/install',
        );
        return;
      }
      const files = await glob(options.include, {
        ignore: 'node_modules/**',
        absolute: true,
      });
      for (const file of files) {
        index.set(file, readFileSync(file, 'utf-8'));
      }
    },
    transformInclude(id: string) {
      return /\.[jt]sx$/.test(id);
    },
    async transform(code: string, id: string) {
      if (!index.has(id) && index.get(id) !== code) {
        index.set(id, code);
      }

      const isTSX = id.endsWith('.tsx');

      const result = await transformAsync(code, {
        plugins: [
          ...getBasePlugins(isTSX),
          [babelPlugin, { ...options, id, index }],
        ],
      });

      return result?.code ?? code;
    },
  };
});

export const getBasePlugins = (isTSX: boolean) => {
  return normalizePlugins([
    '@babel/plugin-syntax-jsx',
    isTSX && ['@babel/plugin-syntax-typescript', { isTSX: true }],
  ]);
};

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
      ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
        if (options.auto?.includes(path.node.source.value)) {
          // get specifiers:
          path.node.specifiers.forEach((specifier) => {
            // rename specifier to _specifier
            // and insertAfter const specifier = block(_specifier)
            path.scope.rename(specifier.local.name, `_${specifier.local.name}`);
            path.insertAfter(
              t.variableDeclaration('const', [
                t.variableDeclarator(
                  specifier.local,
                  t.callExpression(t.identifier('block'), [
                    t.identifier(`_${specifier.local.name}`),
                  ]),
                ),
              ]),
            );


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
