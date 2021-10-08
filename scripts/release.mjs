#!/usr/bin/env zx
import 'zx/globals';
import { info, success, fail } from './helpers.mjs';
$.verbose = false;

info('Checking for errors...');
try {
  await $`zx scripts/check.mjs`;
} catch (_err) {
  fail('checks', 'zx scripts/check.mjs');
}
success('No errors found.');
info('Building distribution bundles...');
try {
  await $`zx scripts/build.mjs`;
} catch (_err) {
  fail('build', 'pnpm build');
}
success('Built distribution bundles.');
info('Please change the version number in `CITATIONS.cff`');
info('Run `np` to publish.');
