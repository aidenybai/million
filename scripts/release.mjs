#!/usr/bin/env zx
import 'zx/globals';
import { info, success, fail, load } from './helpers.mjs';
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
  await $`pnpm zx scripts/build.mjs`;
} catch (_err) {
  fail('build', 'pnpm build');
}
current.stop();
success('Built distribution bundles.');
info(`Please change the version number in ${chalk.gray('`CITATIONS.cff`')}`);
info(`Run ${chalk.gray('`np`')} to publish.`);
