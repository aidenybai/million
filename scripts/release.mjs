import { $ } from 'zx';
import { success, fail, load } from './helpers.mjs';
$.verbose = false;

let current;
current = load('Checking for errors...');
try {
  await $`zx scripts/check.mjs`;
} catch (_err) {
  fail('checks', 'zx scripts/check.mjs');
}
current.stop();
success('No errors found.');

current = load('Building distribution bundles...');
try {
  await $`zx scripts/build.mjs`;
} catch (_err) {
  fail('build', 'pnpm run build');
}
current.stop();
await sleep(1000);

success('Built distribution bundles.');

success('Please run `pnpm run bump` to publish');
