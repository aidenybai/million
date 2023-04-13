import { createUnplugin } from 'unplugin';
import { transformAsync } from '@babel/core';
import forgetti from 'forgetti';
import babelPlugin from './babel';

interface UserOptions {
  ignoreFiles?: string[];
  memo: boolean;
  mode: 'react' | 'optimize';
}

export const unplugin = createUnplugin((options?: UserOptions) => {
  return {
    enforce: 'pre',
    name: 'million',
    transformInclude(id: string) {
      return /\.[jt]sx$/.test(id);
    },
    async transform(code: string, id: string) {
      if (options?.ignoreFiles?.some((pattern) => id.match(pattern))) {
        return code;
      }

      const plugins: any = ['@babel/plugin-syntax-jsx', [babelPlugin, options]];

      if (/\.[t]sx$/.test(id)) {
        plugins.unshift('@babel/plugin-syntax-typescript');
      }

      if (options?.memo === undefined || options.memo) {
        plugins.push([
          forgetti(),
          {
            preset: {
              optimizeJSX: false,
              componentFilter: {
                source: '^[A-Z]',
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
        ]);
      }

      const result = await transformAsync(code, { plugins });
      return result?.code ?? code;
    },
  };
});

export { babelPlugin };
export default unplugin;
