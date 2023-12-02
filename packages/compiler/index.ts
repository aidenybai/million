import { unplugin } from './plugin';
import type { Options } from './options';

export const vite = unplugin.vite;
export const webpack = unplugin.webpack;
export const rollup = unplugin.rollup;
export const rspack = unplugin.rspack;
export const esbuild = unplugin.esbuild;
export const next = (
  nextConfig: Record<string, any> = {},
  overrideOptions: Options = {}
) => {
  const millionConfig: Options = {
    mode: 'react',
    server: true,
    ...overrideOptions,
  };
  return {
    ...nextConfig,
    webpack(config: Record<string, any>, webpackOptions: Record<string, any>) {
      config.plugins.unshift(
        webpack({
          mute: webpackOptions.isServer,
          ...millionConfig,
        })
      );

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, webpackOptions);
      }
      return config;
    },
  };
};

export default {
  vite,
  webpack,
  rollup,
  rspack,
  esbuild,
  next,
  unplugin,
};
