import { existsSync } from 'node:fs';
import { babel } from './babel';
import type { Options } from './plugin';
import { unplugin } from './plugin';

const memoizedExistsSync = (path: string) => {
  const cachedResult = new Map();
  return () => cachedResult.get(path) ?? cachedResult.set(path, existsSync(path)).get(path);
};

export const vite = unplugin.vite;
export const webpack = unplugin.webpack;
export const rollup = unplugin.rollup;
export const rspack = unplugin.rspack;
export const esbuild = unplugin.esbuild;
export const next = (
  nextConfig: {
    appDir?: boolean;
    basePath?: string;
    webpack?: (config: Record<string, any>, options: any) => any;
  } = {},
  overrideOptions: Options = {},
) => {
  const millionConfig = {
    mode: 'react',
    ...overrideOptions,
    rsc: nextConfig.appDir ?? memoizedExistsSync(`${nextConfig.basePath || ''}/app`)(),
  };

  return {
    ...nextConfig,
    webpack(
      config: Record<string, any>,
      webpackOptions: {
        dir: string;
        isServer: boolean;
      },
    ) {
      config.plugins.unshift(
        webpack({
          server: webpackOptions.isServer,
          log: webpackOptions.isServer,
          ...millionConfig,
        }),
      );

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, webpackOptions);
      }
      return config;
    },
  };
};

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
