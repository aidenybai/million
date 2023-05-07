import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: [
    './packages/million',
    './packages/react',
    './packages/jsx-runtime',
    './packages/compiler',
    './packages/react-server',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
  externals: ['react', 'react-dom', 'million'],
});
