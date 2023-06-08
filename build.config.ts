import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: [
    './packages/million',
    './packages/jsx-runtime',
    './packages/compiler',
    './packages/react',
    './packages/react-server',
    './packages/preact',
    './packages/preact-server',
    './packages/types',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
  externals: ['react', 'react-dom', 'preact', 'million', 'vite', 'esbuild'],
});
