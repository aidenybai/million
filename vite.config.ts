import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'dev',
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, jsxs, Fragment } from 'packages/jsx-runtime'`,
  },
  resolve: {
    alias: {
      packages: resolve(__dirname, './packages'),
    },
  },
  test: {
    watch: false,
    environment: 'jsdom',
    coverage: {
      reporter: ['lcov'],
    },
  },
});
