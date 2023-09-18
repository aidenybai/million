import { declare } from '@babel/helper-plugin-utils';
import { createUnplugin } from 'unplugin';
import { transformAsync } from '@babel/core';
import pluginSyntaxJsx from '@babel/plugin-syntax-jsx';
import pluginSyntaxTypescript from '@babel/plugin-syntax-typescript';
import { blue } from 'kleur/colors';
import { visitor as legacyVdomVisitor } from './vdom';
import {
  callExpressionVisitor as reactCallExpressionVisitor,
  jsxElementVisitor as reactJsxElementVisitor,
  componentVisitor as reactComponentVisitor,
} from './react';
import {
  handleVisitorError,
  styleCommentMessage,
  styleLinks,
  stylePrimaryMessage,
} from './react/utils';
import type { PluginObj, PluginItem } from '@babel/core';
import type * as t from '@babel/types';

export interface Options {
  optimize?: boolean;
  server?: boolean;
  mode?: 'react' | 'preact' | 'react-server' | 'preact-server' | 'vdom';
  mute?: boolean | 'info';
  auto?:
    | boolean
    | { threshold?: number; rsc?: boolean; skip?: (string | RegExp)[] };
  _file?: string;
}

let hasIntroRan = false;
export const intro = (options: Options) => {
  if (hasIntroRan) return;
  hasIntroRan = true;
  const comment = `${
    styleLinks(
      'Schedule a call if you need help: https://million.dev/hotline. To disable help messages, set the "mute" option to true.',
    ) +
    styleCommentMessage(
      '\nThere is no guarantee that features in beta will be completely production ready, so here be dragons.',
    )
  }\n\n${blue('💡 TIP')}: Use ${styleCommentMessage(
    '// million-ignore',
  )} to skip over problematic components.`;

  if (options.optimize) {
    // eslint-disable-next-line no-console
    console.log(
      stylePrimaryMessage(`Optimizing compiler is enabled ✓ (beta)`, comment),
    );
  }
  if (options.auto) {
    // eslint-disable-next-line no-console
    console.log(
      stylePrimaryMessage(`Automatic mode is enabled ✓ (beta)`, comment),
    );
  }
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
  };
});

export const babelPlugin = declare((api, options: Options) => {
  api.assertVersion(7);

  intro(options);

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
