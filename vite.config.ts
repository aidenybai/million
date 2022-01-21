import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'dev',
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, jsxs, Fragment } from 'million/jsx-runtime'`,
  },
  resolve: {
    alias: {
      million: resolve(__dirname, './src'),
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
