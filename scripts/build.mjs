#!/usr/bin/env zx
import 'zx/globals';
import { info, success } from './helpers.mjs';

await $`rm -rf dist/*`;
await $`rollup -c`;

const files = await $`ls -xm -d dist/*`;

info(files);
success('Successfully built distribution files.');

await $`node scripts/fix-jsx-runtime.mjs`;
