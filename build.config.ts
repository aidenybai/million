import { defineBuildConfig, type BuildEntry } from 'unbuild';

const createEntry = (
  input: string,
  builder: string = 'rollup',
  declaration = true,
  format?: 'esm' | 'cjs',
) => {
  return [
    {
      builder,
      input,
      outDir: './dist',
      format: 'esm',
      declaration,
    },
    {
      builder,
      input,
      outDir: './dist',
      format: 'cjs',
      ext: 'cjs',
      declaration,
    },
  ].filter((entry) =>
    format === undefined ? true : entry.format === format,
  ) as BuildEntry[];
};

export default defineBuildConfig({
  entries: [
    ...createEntry('./packages/million'),
    ...createEntry('./packages/react'),
    ...createEntry('./packages/jsx-runtime'),
    ...createEntry('./packages/compiler', 'mkdist', false, 'esm'),
    ...createEntry('./packages/compiler', 'mkdist', false, 'cjs'),
    ...createEntry('./packages/react-server/src', 'mkdist', true, 'esm'),
    ...createEntry('./packages/react-server/src', 'mkdist', false, 'cjs'),
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
  externals: ['react', 'react-dom'],
});
