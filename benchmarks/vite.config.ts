import { defineConfig } from 'vite';
import { resolve } from 'path';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  root: 'benchmarks',
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, jsxs, Fragment } from 'packages/jsx-runtime'`,
  },
  resolve: {
    alias: {
      packages: resolve(__dirname, '../packages'),
    },
  },
  plugins: [
    legacy({
      targets: ['> 0.25%', 'last 2 versions', 'Firefox ESR', 'not dead'],
    }),
  ],
});
