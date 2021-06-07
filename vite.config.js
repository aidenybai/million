export default {
  root: 'dev',
  esbuild: {
    jsxInject: `
      import { m as millionHyperscript } from '../src/m';
      const jsx = (tag, props = {}, ...children) => millionHyperscript(tag, props, children);
    `,
    jsxFactory: 'jsx',
  },
};
