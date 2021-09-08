import beep from '@rollup/plugin-beep';
import commonjs from '@rollup/plugin-commonjs';
import eslint from '@rollup/plugin-eslint';
import resolve from '@rollup/plugin-node-resolve';
import strip from '@rollup/plugin-strip';
import filesize from 'rollup-plugin-filesize';
import { terser } from 'rollup-plugin-terser';
import ts from 'rollup-plugin-ts';

const build = () => [
  entry('./src/index.ts', [
    out('./dist/million.umd.js', { format: 'umd' }),
    out('./dist/million.umd.min.js', { format: 'umd', minify: true }),
    out('./dist/million.cjs.js', { format: 'cjs' }),
    out('./dist/million.cjs.min.js', { format: 'cjs', minify: true }),
    out('./dist/million.esm.js', { format: 'esm' }),
    out('./dist/million.esm.min.js', { format: 'esm', minify: true }),
    out('./dist/million.js', { format: 'esm' }),
  ]),
  entry('./src/jsx.ts', [
    out('./dist/jsx-runtime.cjs.js', { format: 'cjs' }),
    out('./dist/jsx-runtime.cjs.min.js', { format: 'cjs', minify: true }),
    out('./dist/jsx-runtime.esm.js', { format: 'esm' }),
    out('./dist/jsx-runtime.esm.min.js', { format: 'esm', minify: true }),
    out('./dist/jsx-runtime.js', { format: 'esm' }),
  ]),
];

const entry = (input, output) => ({
  input,
  plugins: [
    eslint(),
    commonjs(),
    resolve({ extensions: ['.ts'] }),
    ts(),
    strip({
      functions: ['console.log'],
      include: '**/*.(ts)',
    }),
    beep(),
  ],
  output,
  onwarn: () => {},
});

export const out = (file, { format, minify }) => ({
  file,
  format,
  name: 'Million',
  strict: true,
  plugins: minify
    ? [
        terser(),
        filesize({
          showBrotliSize: true,
          showMinifiedSize: false,
          showBeforeSizes: 'release',
          showGzippedSize: false,
        }),
      ]
    : [],
});

export default build();
