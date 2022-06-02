import { resolve } from 'path';
import { defineConfig } from 'vite';
import { million } from './src/vite-plugin-million';

export default defineConfig({
  resolve: {
    alias: {
      src: resolve(__dirname, './src'),
    },
  },
  plugins: [million({ importSource: 'src/jsx-runtime', react: true })],
  test: {
    watch: false,
    environment: 'jsdom',
    coverage: {
      reporter: ['lcov'],
    },
  },
});
