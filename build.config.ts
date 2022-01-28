export default {
  entries: ['./src/index', './src/jsx-runtime', './src/refresh'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
};
