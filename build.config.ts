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
    { input: './src/react', builder: 'mkdist', outDir: './dist/react', format: 'esm', ext: 'mjs' },
    { input: './src/react', builder: 'mkdist', outDir: './dist/react', format: 'cjs', ext: 'cjs' },
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
});
