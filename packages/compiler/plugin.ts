import path from 'path';
import { createUnplugin } from 'unplugin';
import { createFilter } from '@rollup/pluginutils';
import { transformAsync } from '@babel/core';
import { displayIntro } from './utils/log';
import { visit } from './visit';
import type { Options } from './options';
import type { TransformResult, VitePlugin } from 'unplugin';
import type { ParserOptions } from '@babel/core';

const DEFAULT_INCLUDE = 'src/**/*.{jsx,tsx,ts,js,mjs,cjs}';
const DEFAULT_EXCLUDE = 'node_modules/**/*.{jsx,tsx,ts,js,mjs,cjs}';

export const unplugin = createUnplugin((options: Options = {}) => {
  const filter = createFilter(
    options.filter?.include || DEFAULT_INCLUDE,
    options.filter?.exclude || DEFAULT_EXCLUDE
  );

  // Backwards compatibility for `mode: 'react-server'`:
  // Converts `mode: 'react-server'` to `mode: 'react'` and `server: true`
  if (options.mode?.endsWith('-server')) {
    options.server = true;
    options.mode = 'react';
  }

  // Notice for `mode: 'preact'`, `mode: 'preact-server'`:
  // Throws an error if `mode: 'preact'` or `mode: 'preact-server'` is used
  if (options.mode?.startsWith('preact')) {
    throw new Error(
      'Preact is no longer maintained. Downgrade to a lower version to maintain support'
    );
  }

  return {
    enforce: 'pre',
    name: 'million',
    transformInclude(id: string): boolean {
      return filter(id);
    },
    async transform(code: string, id: string): Promise<TransformResult> {
      displayIntro(options);

      const plugins: ParserOptions['plugins'] = ['jsx'];

      if (/\.[mc]?tsx?$/i.test(id)) {
        plugins.push('typescript');
      }

      const result = await transformAsync(code, {
        plugins: [
          [
            {
              name: 'million',
              visitor: visit(options, id),
            },
            options,
          ],
        ],
        parserOpts: { plugins },
        filename: path.basename(id),
        ast: false,
        sourceFileName: id,
        sourceMaps: true,
        configFile: false,
        babelrc: false,
      });

      if (result) {
        return { code: result.code || '', map: result.map };
      }
      return null;
    },
    vite: {
      configResolved(config) {
        // run our plugin before the following plugins:
        repushPlugin(config.plugins as VitePlugin[], 'million', [
          // https://github.com/withastro/astro/blob/main/packages/astro/src/vite-plugin-jsx/index.ts#L173
          'astro:jsx',
          // https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react
          'vite:react-babel',
          'vite:react-jsx',
          // https://github.com/preactjs/preset-vite/blob/main/src/index.ts
          'vite:preact-jsx',
        ]);

        options.hmr =
          config.server.hmr &&
          !config.isProduction &&
          config.command !== 'build';
      },
    },
  };
});

// From: https://github.com/bluwy/whyframe/blob/master/packages/jsx/src/index.js#L27-L37
export const repushPlugin = (
  plugins: VitePlugin[],
  pluginName: string,
  pluginNames: string[]
) => {
  const namesSet = new Set(pluginNames);

  let baseIndex = -1;
  let targetIndex = -1;
  let targetPlugin: VitePlugin;
  for (let i = 0, len = plugins.length; i < len; i += 1) {
    const current = plugins[i]!;
    if (namesSet.has(current.name) && baseIndex === -1) {
      baseIndex = i;
    }
    if (current.name === pluginName) {
      targetIndex = i;
      targetPlugin = current;
    }
  }
  if (baseIndex !== -1 && targetIndex !== -1 && baseIndex < targetIndex) {
    plugins.splice(targetIndex, 1);
    plugins.splice(baseIndex, 0, targetPlugin!);
  }
};
