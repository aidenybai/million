import { declare } from '@babel/helper-plugin-utils';
import { displayIntro } from './utils/intro';
import { visitors, init } from './visitors';
import type { Options } from './plugin';

export const babelPlugin = declare((api, options: Options, dirname: string) => {
  api.assertVersion(7);

  displayIntro();

  // Backwards compatibility for `mode: 'react-server'`:
  // Converts `mode: 'react-server'` to `mode: 'react'` and `server: true`
  if (options.mode?.endsWith('-server')) {
    options.server = true;
    options.mode = options.mode.replace('-server', '') as 'react' | 'preact';
  }

  const v = visitors[options.mode!];

  const vis = init(visitors[options.mode!], options);

  const blockCache = new Map<string, t.Identifier>();

  const plugin: PluginObj = {
    name: 'million',
    visitor: {
      JSXElement(path) {
        vis.JSXElement(path, dirname);
      },
      CallExpression(path) {
        handleVisitorError(() => {
          callExpressionVisitor(path, blockCache, dirname);
        }, options.mute);
      },
      FunctionDeclaration(path) {
        handleVisitorError(() => {
          if (!componentVisitor) return;
          componentVisitor(path, dirname);
        }, options.mute);
      },
      VariableDeclarator(path) {
        handleVisitorError(() => {
          if (!componentVisitor) return;
          componentVisitor(path, dirname);
        }, options.mute);
      },
    },
    post() {
      blockCache.clear();
    },
  };
  return plugin;
});
