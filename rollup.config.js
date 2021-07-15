import beep from '@rollup/plugin-beep';
import commonjs from '@rollup/plugin-commonjs';
import eslint from '@rollup/plugin-eslint';
import resolve from '@rollup/plugin-node-resolve';
import strip from '@rollup/plugin-strip';
import filesize from 'rollup-plugin-filesize';
import { terser } from 'rollup-plugin-terser';
import ts from 'rollup-plugin-ts';

const suite = async (input, output) => {
  return {
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
  };
};

export const unit = ({ file, format, minify }) => ({
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

export default suite('./src/index.ts', [
  unit({
    file: './dist/million.umd.js',
    format: 'umd',
  }),
  unit({
    file: './dist/million.umd.min.js',
    format: 'umd',
    minify: true,
  }),
  unit({
    file: './dist/million.cjs.js',
    format: 'cjs',
  }),
  unit({
    file: './dist/million.cjs.min.js',
    format: 'cjs',
    minify: true,
  }),
  unit({
    file: './dist/million.esm.js',
    format: 'esm',
  }),
  unit({
    file: './dist/million.esm.min.js',
    format: 'esm',
    minify: true,
  }),
]);
