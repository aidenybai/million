import { $ } from 'zx';
import { info, success } from './helpers.mjs';

await $`rm -rf dist/*`;
await $`tsup`;
await $`esbuild src/jsx-runtime.ts --minify --bundle --outfile=dist/code-size-measurement.js`;

const files = await $`ls -xm -d dist/*`;

info(String(files));
await $`export-size .`;
success('Successfully built distribution files.');
