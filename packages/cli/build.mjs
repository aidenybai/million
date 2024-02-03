import { build } from 'esbuild';
import { replace } from 'esbuild-plugin-replace';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const version = JSON.parse(
  readFileSync(join(__dirname, '../../package.json'), 'utf-8'),
).version;

build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'dist/index.js',
  plugins: [
    replace({
      'process.env.VERSION': JSON.stringify(version),
    }),
  ],
});
