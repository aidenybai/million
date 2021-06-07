export default {
  root: 'dev',
  esbuild: {
    jsxInject: `
      import { m as __million_hyperscript } from '../src/m';
      const __jsx_factory = (tag, props = {}, ...children) => __million_hyperscript(tag, props, children);
    `,
    jsxFactory: '__jsx_factory',
  },
};
