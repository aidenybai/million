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
    './src/react',
    {
      input: './src/react/exports',
      builder: 'mkdist',
      outDir: './dist/react',
      ext: 'mjs',
      format: 'esm',
    },
    {
      input: './src/react/exports',
      builder: 'mkdist',
      outDir: './dist/react',
      ext: 'cjs',
      format: 'cjs',
    },
  ],
  externals: ['tslib'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: false,
  },
});
