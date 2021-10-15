#!/usr/bin/env zx
import 'zx/globals';
import { info, success, fail, load } from './helpers.mjs';
$.verbose = false;

const loader1 = load('Checking for errors...');
try {
  await $`zx scripts/check.mjs`;
} catch (_err) {
  fail('checks', 'zx scripts/check.mjs');
}
loader1.stop();
success('No errors found.');
const loader2 = load('Building distribution bundles...');
try {
  await $`pnpm zx scripts/build.mjs`;
} catch (_err) {
  fail('build', 'pnpm build');
}
loader2.stop();
success('Built distribution bundles.');
info(`Please change the version number in ${chalk.gray('`CITATIONS.cff`')}`);
info(`Run ${chalk.gray('`np`')} to publish.`);
