import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
export default defineConfig({
  plugins: [tsconfigPaths()],
  esbuild: {
    jsxFactory: 'h',
    jsxInject: `import { h } from 'packages/jsx-runtime';`,
  },
  test: {
    environment: 'jsdom',
    coverage: {
      reporter: ['lcov'],
    },
    globals: true,
  },
});
