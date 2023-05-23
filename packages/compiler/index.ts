import { createUnplugin } from 'unplugin';
import { transformAsync } from '@babel/core';
import babel from './babel';
import type { UserOptions } from './types';

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

      const plugins: any = ['@babel/plugin-syntax-jsx'];

      if (id.endsWith('.tsx')) {
        plugins.push(['@babel/plugin-syntax-typescript', { isTSX: true }]);
      }

      const result = await transformAsync(code, {
        plugins: [...plugins, [babel, options]],
      });
      code = result?.code ?? code;

      return code;
    },
  };
});

export const next = (nextConfig: Record<string, any> = {}) => {
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

export const vite = unplugin.vite;
export const webpack = unplugin.webpack;
export const rollup = unplugin.rollup;
export const rspack = unplugin.rspack;
export const esbuild = unplugin.esbuild;
export { babel };

export default {
  vite,
  webpack,
  rollup,
  rspack,
  esbuild,
  next,
  unplugin,
  babel,
};
