import { $ } from 'zx';
import { write } from 'fsxx';
import { info, success } from './helpers.mjs';

await $`rm -rf dist/*`;
await $`unbuild`;
await $`esbuild packages/jsx-runtime/index.ts --minify --bundle --outfile=dist/code-size-measurement.js`;

await write('./jsx-runtime.d.ts', `export * from './dist/jsx-runtime';`);
await write('./refresh.d.ts', `export * from './dist/refresh';`);

const files = await $`ls -xm -d dist/*`;

info(String(files));
await $`export-size .`;
success('Successfully built distribution files.');
