import { defineConfig } from 'vite';

export default defineConfig({
  root: 'benchmarks',
  esbuild: {
    jsxFactory: 'jsx',
    jsxFragment: 'Fragment',
    jsxInject: `import { jsx, jsxs, Fragment } from './_jsx'`,
  },
});
