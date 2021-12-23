#!/usr/bin/env zx
import 'zx/globals';
import { info, success } from './helpers.mjs';

await $`rm -rf dist/*`;
await $`tsup`;
await $`esbuild src/jsx-runtime.ts --minify --bundle --outfile=dist/code-size-measurement.js`;

const files = await $`ls -xm -d dist/*`;

info(files);
success('Successfully built distribution files.');
