import { createUnplugin } from 'unplugin';
import { transformAsync } from '@babel/core';
import babelPlugin from './babel';

interface UserOptions {
  ignoreFiles?: string[];
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

      const plugins = ['@babel/plugin-syntax-jsx', [babelPlugin, options]];

      if (/\.[t]sx$/.test(id)) {
        plugins.unshift('@babel/plugin-syntax-typescript');
      }

      const result = await transformAsync(code, { plugins });
      return result?.code ?? code;
    },
  };
});

export { babelPlugin };
export default unplugin;
