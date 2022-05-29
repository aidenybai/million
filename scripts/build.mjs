import { $ } from 'zx';
import { write } from 'fsxx';
import { info, success } from './helpers.mjs';

await $`rm -rf dist/*`;
await $`unbuild`;
await $`esbuild src/jsx-runtime/index.ts --minify --bundle --outfile=dist/code-size-measurement.js`;

const packages = [
  'jsx-runtime',
  'router',
  'html',
  'morph',
  'vite-plugin-million',
  'utils',
];

for (const pkg of packages) {
  await write(`./${pkg}.d.ts`, `export * from './dist/${pkg}';`);
}

const files = await $`ls -xm -d dist/*`;

info(String(files));
await $`export-size .`;
success('Successfully built distribution files.');
