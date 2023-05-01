import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: [
    './packages/million',
    './packages/react',
    './packages/jsx-runtime',
    './packages/compiler',
    {
      builder: 'mkdist',
      input: './packages/next/src',
      outDir: './dist',
      format: 'esm',
      declaration: true,
    },
    {
      builder: 'mkdist',
      input: './packages/next/src',
      outDir: './dist',
      format: 'cjs',
      ext: 'cjs',
    },
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
  externals: ['react', 'react-dom'],
});
