import { resolve } from 'path';
import { defineConfig } from 'vite';
import million from './packages/vite-plugin-million';

export default defineConfig({
  root: 'dev',
  resolve: {
    alias: {
      packages: resolve(__dirname, './packages'),
    },
  },
  plugins: [million()],
  test: {
    watch: false,
    environment: 'jsdom',
    coverage: {
      reporter: ['lcov'],
    },
  },
});
