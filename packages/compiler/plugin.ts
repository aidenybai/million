import type { BabelFileResult, ParserOptions } from '@babel/core';
import { transformAsync } from '@babel/core';
import type { FilterPattern } from '@rollup/pluginutils';
import { createFilter } from '@rollup/pluginutils';
import type { VitePlugin } from 'unplugin';
import { createUnplugin } from 'unplugin';
import { MillionTelemetry } from '../telemetry';
import { babel } from './babel';
import { displayIntro } from './utils/log';
// import { babel } from './babel';
import type { CompilerOptions } from './types';

const DEFAULT_INCLUDE = '**/*.{jsx,tsx}';
const DEFAULT_EXCLUDE = 'node_modules/**/*.{jsx,tsx,ts,js,mjs,cjs}';

interface CompilerOutput {
  code: BabelFileResult['code'];
  map: BabelFileResult['map'];
}

let ssr = false;

async function compile(
  id: string,
  code: string,
  options: Options,
  telemetryInstance: MillionTelemetry,
  isServer?: boolean,
): Promise<CompilerOutput> {
  if (isServer) {
    // for frameworks like remix, even for client, we need to return react-server
    ssr = true;
  }

  displayIntro(options);

  const plugins: ParserOptions['plugins'] = [
    'jsx',
    // import { example } from 'example' with { example: true };
    'importAttributes',
    // () => throw example
    'throwExpressions',
    // You know what this is
    'decorators',
    // const { #example: example } = this;
    'destructuringPrivate',
    // using example = myExample()
    'explicitResourceManagement',
  ];

  if (/\.[mc]?tsx?$/i.test(id)) {
    plugins.push('typescript');
  }

  const result = await transformAsync(code, {
    plugins: [
      [
        babel,
        {
          telemetry: telemetryInstance,
          log: options.log,
          server: ssr,
          hmr: options.hmr,
          auto: options.auto,
          rsc: options.rsc,
        },
      ],
    ],
    // plugins: [[babel, options]],
    parserOpts: { plugins },
    filename: id,
    ast: false,
    sourceFileName: id,
    sourceMaps: true,
    configFile: false,
    babelrc: false,
  });
  if (!result) {
    throw new Error('invariant');
  }
  return { code: result.code || '', map: result.map };
}

export interface Options extends Omit<CompilerOptions, 'telemetry'> {
  filter?: {
    include?: FilterPattern;
    exclude?: FilterPattern;
  };
  /**
   * @default 'react'
   */
  mode?: 'react' | 'vdom';
  /**
   * Million.js collects anonymous telemetry data about general usage. Participation is optional, and you may opt-out at any time.
   * For more information, please see https://million.dev/telemetry.
   * @default true
   */
  telemetry?: boolean;
}

// eslint-disable-next-line @typescript-eslint/default-param-last
export const unplugin = createUnplugin((options: Options = {}, meta) => {
  if (!options.log) {
    options.log = true;
  }

  const filter = createFilter(
    options.filter?.include || DEFAULT_INCLUDE,
    options.filter?.exclude || DEFAULT_EXCLUDE,
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
      'Preact is no longer maintained. Downgrade to a lower version (<= 2.x.x) for support',
    );
  }

  const telemetryInstance = new MillionTelemetry(options.telemetry);

  void telemetryInstance.record({
    event: 'compile',
    payload: {
      framework: meta.framework,
      mode: options.mode,
      server: options.server,
      hmr: options.hmr,
      rsc: options.rsc,
      log: options.log,
      auto: options.auto,
      // optimize: options.optimize,
    },
  });

  return {
    enforce: 'pre',
    name: 'million',
    transformInclude(id: string): boolean {
      return filter(id);
    },
    async transform(code: string, id: string) {
      try {
        const result = await compile(
          id,
          code,
          options,
          telemetryInstance,
          options.server,
        );
        return {
          code: result.code || '',
          map: result.map,
        };
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return { code: '' };
      }
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
          // https://github.com/vitejs/vite-plugin-react-swc/blob/main/src/index.ts
          'vite:react-swc',
        ]);

        options.hmr = config.env.DEV;
      },
      async transform(code, id, opts) {
        try {
          if (filter(id)) {
            const result = await compile(
              id,
              code,
              options,
              telemetryInstance,
              opts?.ssr,
            );
            return {
              code: result.code || '',
              map: result.map,
            };
          }
          return null;
        } catch (_err) {
          return null;
        }
      },
    },
  };
});

// From: https://github.com/bluwy/whyframe/blob/master/packages/jsx/src/index.js#L27-L37
export const repushPlugin = (
  plugins: VitePlugin[],
  pluginName: string,
  pluginNames: string[],
): void => {
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
