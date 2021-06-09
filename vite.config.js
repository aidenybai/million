export default {
  root: 'dev',
  esbuild: {
    jsxInject: `import { m } from '../src/m';`,
    jsxFactory: 'm',
  },
};
