import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { million } from './src/vite-plugin-million';

const src = resolve(__dirname, './src');

export default defineConfig({
  server: {
    open: '/dev/index.html'
  },
  resolve: {
    alias: {
      src,
    },
  },
  plugins: [million({ importSource: src, react: true })],
  test: {
    watch: false,
    environment: 'jsdom',
    coverage: {
      reporter: ['lcov'],
    },
  },
});
