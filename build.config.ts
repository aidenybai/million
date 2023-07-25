import { defineBuildConfig } from 'unbuild';
import banner from 'rollup-plugin-banner2';

export default defineBuildConfig({
  entries: [
    './packages/million',
    './packages/jsx-runtime',
    './packages/compiler',
    './packages/react',
    './packages/react-server',
    './packages/preact',
    './packages/preact-server',
    './packages/types',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
  hooks: {
    'rollup:options'(_ctx, options) {
      options?.plugins?.push(banner(() => `'use client';\n`));
    },
  },
  externals: ['react', 'react-dom', 'preact', 'million', 'vite', 'esbuild'],
});
