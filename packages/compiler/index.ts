import { existsSync } from 'node:fs';
import { unplugin } from './plugin';
import type { Options } from './options';
import { babel } from './babel';

export const vite = unplugin.vite;
export const webpack = unplugin.webpack;
export const rollup = unplugin.rollup;
export const rspack = unplugin.rspack;
export const esbuild = unplugin.esbuild;
export const next = (
  nextConfig: {
    appDir?: boolean;
    basePath?: string;
  } = {},
  overrideOptions: Options = {},
) => {
  const millionConfig: Options = {
    mode: 'react',
    server: true,
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
          mute: webpackOptions.isServer,
          ...millionConfig,
        }),
      );

      // @ts-ignore
      if (typeof nextConfig.webpack === 'function') {
        // @ts-ignore
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
