import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: [
    './packages/million',
    './packages/block',
    './packages/jsx-runtime',
    './packages/utils',
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
  externals: ['espree'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: false,
  },
});
