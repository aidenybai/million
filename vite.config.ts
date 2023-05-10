import { resolve } from 'path';
import { defineConfig } from 'vite';
import reactRefresh from "@vitejs/plugin-react";

export default defineConfig({
  esbuild: {
    jsxFactory: 'h', 
    jsxInject: `import {h} from 'packages/jsx-runtime' `,
  },
  test: {
    environment: 'jsdom',
    coverage: {
      reporter: ['lcov'],
    },
  },
  resolve: {
    alias: {
      '^packages/jsx-runtime$': resolve(__dirname, 'packages/jsx-runtime'),
    },
  },
  plugins: [
    reactRefresh()
  ],
});
