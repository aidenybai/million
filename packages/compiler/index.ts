import { existsSync } from 'node:fs';
import { babel } from './babel';
import type { Options } from './plugin';
import { unplugin } from './plugin';

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
): any => {
  const millionConfig: Options = {
    mode: 'react',
    ...overrideOptions,
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
      if (millionConfig.rsc === undefined) {
        millionConfig.rsc =
          nextConfig.appDir ??
          existsSync(`${webpackOptions.dir}${nextConfig.basePath || ''}/app`);
      }

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
