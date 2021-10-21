import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'dev',
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, jsxs, Fragment } from 'million/jsx'`,
  },
  resolve: {
    alias: {
      million: resolve(__dirname, './src'),
    },
  },
});
