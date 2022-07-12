import { defineConfig } from 'vite';
import { resolve } from 'path';
import legacy from '@vitejs/plugin-legacy';

const packages = resolve(__dirname, '../packages');

export default defineConfig({
  resolve: {
    alias: {
      packages,
    },
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment } from 'packages/jsx-runtime';`,
  },
  plugins: [
    legacy({
      targets: ['> 0.25%', 'last 2 versions', 'Firefox ESR', 'not dead'],
    }),
  ],
});
