import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['./packages/million', './packages/jsx-runtime', './packages/ssr'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
});
