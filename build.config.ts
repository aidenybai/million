import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['./packages/million', './packages/jsx-runtime', './packages/refresh'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
});
