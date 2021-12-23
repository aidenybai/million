import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/jsx-runtime.ts'],
  format: ['esm', 'cjs'],
  platform: 'browser',
  splitting: false,
  sourcemap: true,
  silent: true,
  clean: true,
  dts: true,
});
