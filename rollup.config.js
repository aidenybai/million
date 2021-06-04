import beep from '@rollup/plugin-beep';
import commonjs from '@rollup/plugin-commonjs';
import eslint from '@rollup/plugin-eslint';
import resolve from '@rollup/plugin-node-resolve';
import strip from '@rollup/plugin-strip';
import ts from '@wessberg/rollup-plugin-ts';
import filesize from 'rollup-plugin-filesize';
import { terser } from 'rollup-plugin-terser';

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

export default suite('./src/vdom/index.ts', [
  unit({
    file: './dist/vdom/million.esm.js',
    format: 'esm',
  }),
  unit({
    file: './dist/vdom/million.cjs.js',
    format: 'cjs',
  }),
  unit({
    file: './dist/vdom/million.umd.js',
    format: 'umd',
  }),
  unit({
    file: './dist/vdom/million.js',
    format: 'iife',
  }),
  unit({
    file: './dist/vdom/million.min.js',
    format: 'iife',
    minify: true,
  }),
]);
