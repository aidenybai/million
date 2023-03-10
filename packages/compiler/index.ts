import { createUnplugin } from 'unplugin';
import * as babel from '@babel/core';
import { plugin } from './babel';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface UserOptions {}

export const unplugin = createUnplugin((_options: UserOptions) => {
  return {
    name: 'unplugin-million',
    transformInclude(id: string) {
      return /\.[jt]sx$/.test(id);
    },
    async transform(code: string) {
      const result = await babel.transformAsync(code, { plugins: [plugin] });
      return result.code;
    },
  };
});

export const vite = unplugin.vite;
export const rollup = unplugin.rollup;
export const webpack = unplugin.webpack;
export const esbuild = unplugin.esbuild;
