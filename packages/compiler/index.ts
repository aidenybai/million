import { createUnplugin } from 'unplugin';
import { transformAsync } from '@babel/core';
import forgetti from 'forgetti';
import babelPlugin from './babel';
import type { UserOptions } from './types';

const unplugin = createUnplugin((options?: UserOptions) => {
  return {
    enforce: 'pre',
    name: 'million',
    transformInclude(id: string) {
      return /\.[jt]sx$/.test(id);
    },
    async transform(code: string, id: string) {
      try {
        if (options?.ignoreFiles?.some((pattern) => id.match(pattern))) {
          return code;
        }

        const plugins: any = ['@babel/plugin-syntax-jsx'];

        if (id.endsWith('.tsx')) {
          console.log('adding tsx plugin');
          plugins.unshift([
            '@babel/plugin-transform-typescript',
            { jsx: 'preserve' },
          ]);
        }

        let result = await transformAsync(code, {
          plugins: [...plugins, [babelPlugin, options]],
        });
        if (options?.memo) {
          result = await transformAsync(result?.code ?? code, {
            plugins: [
              ...plugins,
              [
                forgetti(),
                {
                  preset: {
                    optimizeJSX: false,
                    componentFilter: {
                      source: '^_',
                      flags: '',
                    },
                    hookFilter: {
                      source: '^use[A-Z]',
                      flags: '',
                    },
                    memo: {
                      name: 'useMemo',
                      source: 'react',
                      kind: 'named',
                    },
                    hooks: [
                      {
                        type: 'ref',
                        name: 'useRef',
                        source: 'react',
                        kind: 'named',
                      },
                      {
                        type: 'memo',
                        name: 'useMemo',
                        source: 'react',
                        kind: 'named',
                      },
                      {
                        type: 'callback',
                        name: 'useCallback',
                        source: 'react',
                        kind: 'named',
                      },
                      {
                        type: 'effect',
                        name: 'useEffect',
                        source: 'react',
                        kind: 'named',
                      },
                      {
                        type: 'effect',
                        name: 'useLayoutEffect',
                        source: 'react',
                        kind: 'named',
                      },
                      {
                        type: 'effect',
                        name: 'useInsertionEffect',
                        source: 'react',
                        kind: 'named',
                      },
                    ],
                    hocs: [
                      {
                        name: 'forwardRef',
                        source: 'react',
                        kind: 'named',
                      },
                      {
                        name: 'memo',
                        source: 'react',
                        kind: 'named',
                      },
                    ],
                  },
                },
              ],
            ],
          });
        }
        return result?.code ?? code;
      } catch (_err) {
        console.log(_err);
        return code;
      }
    },
  };
});

const next = (nextConfig: Record<string, any> = {}) => {
  return {
    ...nextConfig,
    webpack(config: Record<string, any>, options: Record<string, any>) {
      config.plugins.unshift(unplugin.webpack({ mode: 'react-server' }));

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }
      return config;
    },
  };
};

export default { ...unplugin, next };
