import { $ } from 'zx';
import { write } from 'fsxx';
import { info, success } from './helpers.mjs';

await $`rm -rf dist/*`;
await $`unbuild`;
await $`mkdir dist/measurement`
await $`esbuild packages/react/react.ts --legal-comments=none --minify --outfile=dist/measurement/normal.js`;
await $`esbuild packages/react/react.ts --bundle --legal-comments=none --minify --outfile=dist/measurement/react.js`;
await $`esbuild packages/million/index.ts --bundle --legal-comments=none --minify --outfile=dist/measurement/million.js`;

const packages = [
  'jsx-runtime',
  'router',
  'html',
  'react',
  'morph',
  'vite-plugin-million',
  'utils',
];

for (const pkg of packages) {
  await write(`./${pkg}.d.ts`, `export * from './dist/${pkg}';`);
}

const files = await $`ls -xm -d dist/*`;

info(String(files));
success('Successfully built distribution files.');
