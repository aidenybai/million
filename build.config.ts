import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: [
    './packages/million',
    './packages/jsx-runtime',
    './packages/utils',
    './packages/router',
    './packages/html',
    './packages/morph',
    './packages/vite-plugin-million',
    './packages/react',
    {
      input: './packages/react/exports',
      builder: 'mkdist',
      outDir: './dist/react',
      ext: 'mjs',
      format: 'esm',
    },
    {
      input: './packages/react/exports',
      builder: 'mkdist',
      outDir: './dist/react',
      ext: 'cjs',
      format: 'cjs',
    },
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: false,
  },
});
