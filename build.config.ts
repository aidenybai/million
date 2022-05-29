import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: [
    './src/million',
    './src/jsx-runtime',
    './src/utils',
    './src/router',
    './src/html',
    './src/morph',
    './src/vite-plugin-million',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
});
