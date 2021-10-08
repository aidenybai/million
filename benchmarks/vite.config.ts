import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'benchmarks',
  esbuild: {
    jsxFactory: 'jsx',
    jsxFragment: 'Fragment',
    jsxInject: `import { jsx, jsxs, Fragment } from 'million/jsx'`,
  },
  resolve: {
    alias: {
      million: resolve(__dirname, '../src'),
    },
  },
});
