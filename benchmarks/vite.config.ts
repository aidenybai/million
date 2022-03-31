import { defineConfig } from 'vite';
import { resolve } from 'path';
import legacy from '@vitejs/plugin-legacy';
import million from '../packages/vite-plugin-million';

export default defineConfig({
  root: 'benchmarks',
  resolve: {
    alias: {
      packages: resolve(__dirname, '../packages'),
    },
  },
  plugins: [
    million({ importSource: 'packages/jsx-runtime' }),
    legacy({
      targets: ['> 0.25%', 'last 2 versions', 'Firefox ESR', 'not dead'],
    }),
  ],
});
