import { resolve } from 'path';
import { defineConfig } from 'vite';
import { million } from './packages/vite-plugin-million';

export default defineConfig({
  resolve: {
    alias: {
      packages: resolve(__dirname, './packages'),
    },
  },
  plugins: [million({ importSource: 'packages/jsx-runtime' })],
  test: {
    watch: false,
    environment: 'jsdom',
    coverage: {
      reporter: ['lcov'],
    },
  },
});
