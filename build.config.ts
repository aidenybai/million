import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['./packages/million', './packages/react'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: false,
  },
  externals: ['react', 'react-dom'],
});
