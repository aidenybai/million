import { defineConfig } from 'vite';
import { resolve } from 'path';
import legacy from 'vite-plugin-legacy';

export default defineConfig({
  root: 'benchmarks',
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, jsxs, Fragment } from 'million/jsx'`,
  },
  resolve: {
    alias: {
      million: resolve(__dirname, '../src'),
    },
  },
  plugins: [
    legacy({
      targets: ['> 0.25%', 'last 2 versions', 'Firefox ESR', 'not dead'],
    }),
  ],
});
