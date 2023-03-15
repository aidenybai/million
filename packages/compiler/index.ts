import { createUnplugin } from 'unplugin';
import { transformAsync } from '@babel/core';
import { plugin } from './babel';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface UserOptions {}

export const unplugin = createUnplugin((_options: UserOptions) => {
  return {
    enforce: 'pre',
    name: 'million',
    transformInclude(id: string) {
      return /\.[jt]sx$/.test(id);
    },
    async transform(code: string) {
      const result = await transformAsync(code, {
        plugins: ['@babel/plugin-syntax-jsx', plugin],
      });
      return result?.code;
    },
  };
});

export const babelPlugin = plugin;
export const vite = unplugin.vite;
export const rollup = unplugin.rollup;
export const webpack = unplugin.webpack;
export const rspack = unplugin.rspack;
export const esbuild = unplugin.esbuild;
