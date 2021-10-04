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
    out('./dist/million.cjs.js', { format: 'cjs' }),
    out('./dist/million.esm.js', { format: 'esm' }),
    out('./dist/million.js', { format: 'esm' }),
  ]),
  entry('./src/jsx.ts', [
    out('./dist/jsx-runtime.cjs.js', { format: 'cjs' }),
    out('./dist/jsx-runtime.esm.js', { format: 'esm' }),
    out('./dist/jsx-runtime.js', { format: 'esm' }),
    // Used to determine a realistic bundle size for VNode + JSX
    out('./dist/code-size-measurement.js', { format: 'esm', minify: true }),
  ]),
];

const entry = (input, output) => ({
  input,
  output,
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
