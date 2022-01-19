export default {
  entries: ['./src/index', './src/jsx-runtime'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
};
