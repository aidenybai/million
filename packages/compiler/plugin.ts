import { declare } from '@babel/helper-plugin-utils';
import { createUnplugin } from 'unplugin';
import { transformAsync } from '@babel/core';
import pluginSyntaxJsx from '@babel/plugin-syntax-jsx';
import pluginSyntaxTypescript from '@babel/plugin-syntax-typescript';
import { dim, magenta } from 'kleur/colors';
import { visitor as legacyVdomVisitor } from './vdom';
import {
  callExpressionVisitor as reactCallExpressionVisitor,
  jsxElementVisitor as reactJsxElementVisitor,
  componentVisitor as reactComponentVisitor,
} from './react';
import { handleVisitorError } from './react/utils';
import type { PluginObj, PluginItem } from '@babel/core';
import type * as t from '@babel/types';

export interface Options {
  optimize?: boolean;
  server?: boolean;
  mode?: 'react' | 'preact' | 'react-server' | 'preact-server' | 'vdom';
  mute?: boolean | 'info';
  hmr?: boolean;
  auto?:
    | boolean
    | { threshold?: number; rsc?: boolean; skip?: (string | RegExp)[] };
  _file?: string;
}

let hasIntroRan = false;
export const intro = () => {
  if (hasIntroRan) return;
  hasIntroRan = true;

  // eslint-disable-next-line no-console
  console.log(`\n  ${magenta(`⚡ Million.js ${process.env.VERSION || ''}`)}
  - Tip:     use ${dim('// million-ignore')} for errors
  - Hotline: https://million.dev/hotline\n`);
};

export const unplugin = createUnplugin((options: Options) => {
  options ??= {};

  return {
    enforce: 'pre',
    name: 'million',
    transformInclude(id: string) {
      return /\.[jt]sx$/.test(id);
    },
    async transform(code: string, id: string) {
      options._file = id;

      const plugins: PluginItem[] = [[pluginSyntaxJsx]];

      const isTSX = id.endsWith('.tsx');
      if (isTSX) {
        plugins.push([
          pluginSyntaxTypescript,
          { allExtensions: true, isTSX: true },
        ]);
      }

      plugins.push([babelPlugin, options]);

      const result = await transformAsync(code, { plugins, filename: id });

      return result?.code || null;
    },
    vite: {
      configResolved(config) {
        options.hmr =
          config.server.hmr &&
          !config.isProduction &&
          config.command !== 'build';
      },
    },
  };
});

export const babelPlugin = declare((api, options: Options) => {
  api.assertVersion(7);

  intro();

  const file = options._file!;
  let callExpressionVisitor: ReturnType<typeof reactCallExpressionVisitor>;
  let jsxElementVisitor: ReturnType<typeof reactJsxElementVisitor> | undefined;
  let componentVisitor: ReturnType<typeof reactComponentVisitor> | undefined;

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
      componentVisitor = reactComponentVisitor(options, false);
      break;
    case 'react':
    default:
      callExpressionVisitor = reactCallExpressionVisitor(options, true);
      jsxElementVisitor = reactJsxElementVisitor(options, true);
      componentVisitor = reactComponentVisitor(options, true);
      break;
  }

  const blockCache = new Map<string, t.Identifier>();

  const plugin: PluginObj = {
    name: 'million',
    visitor: {
      JSXElement(path) {
        handleVisitorError(() => {
          if (!jsxElementVisitor) return;
          jsxElementVisitor(path, file);
        }, options.mute);
      },
      CallExpression(path) {
        handleVisitorError(() => {
          callExpressionVisitor(path, blockCache, file);
        }, options.mute);
      },
      FunctionDeclaration(path) {
        handleVisitorError(() => {
          if (!componentVisitor) return;
          componentVisitor(path, file);
        }, options.mute);
      },
      VariableDeclarator(path) {
        handleVisitorError(() => {
          if (!componentVisitor) return;
          componentVisitor(path, file);
        }, options.mute);
      },
    },
    post() {
      blockCache.clear();
    },
  };
  return plugin;
});
