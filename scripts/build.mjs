import { $ } from 'zx';
import { write } from 'fsxx';
import { info, success } from './helpers.mjs';

await $`rm -rf dist/*`;
await $`esbuild src/react/react.ts --legal-comments=none --minify --outfile=dist/code-size-measurement.js`;
await $`unbuild`;

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
