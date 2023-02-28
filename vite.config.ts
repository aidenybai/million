import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxInject: `import { h } from 'packages/jsx-runtime';`,
  },
  test: {
    environment: 'jsdom',
    coverage: {
      reporter: ['lcov'],
    },
  },
});
