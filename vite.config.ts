import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { million } from './packages/vite-plugin-million';

const packages = resolve(__dirname, './packages');

export default defineConfig({
  server: {
    open: '/dev/index.html',
  },
  resolve: {
    alias: {
      packages,
    },
  },
  plugins: [million({ importSource: packages, react: true })],
  test: {
    environment: 'jsdom',
    coverage: {
      reporter: ['lcov'],
    },
  },
});
