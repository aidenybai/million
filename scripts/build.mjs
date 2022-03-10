import { $ } from 'zx';
import { write } from 'fsxx';
import { info, success } from './helpers.mjs';

await $`rm -rf dist/*`;
await $`unbuild`;
await $`esbuild packages/jsx-runtime/index.ts --minify --bundle --outfile=dist/code-size-measurement.js`;

const packages = ['jsx-runtime', 'ssr', 'block', 'router', 'html', 'shared'];

for (const pkg of packages) {
  await write(`./${pkg}.d.ts`, `export * from './dist/${pkg}';`);
}

const files = await $`ls -xm -d dist/*`;

info(String(files));
await $`export-size .`;
success('Successfully built distribution files.');
