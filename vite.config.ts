import { defineConfig } from 'vite';

export default defineConfig({
  root: 'dev',
  esbuild: {
    jsxFactory: 'jsx',
    jsxFragment: 'Fragment',
    jsxInject: `import { jsx, jsxs, Fragment } from '../src/jsx'`,
  },
});
