#! /usr/bin/env node

import { intro, outro } from '@clack/prompts';
import { bold, green, magenta } from 'kleur/colors';
import { installPackage } from './utils/package-manager.js';
import { abort } from './utils/utils.js';
import { handleConfigFile } from './utils/config.js';
import { isPackageInstalled } from './utils/package-json.js';

async function runMillionWizard(): Promise<void> {
  const isMillionAlreadyInstalled = await isPackageInstalled();
  await installPackage({
    packageName: 'million',
    alreadyInstalled: isMillionAlreadyInstalled,
  });
  if (!isMillionAlreadyInstalled) {
    await handleConfigFile();
  }
}

async function main(): Promise<void> {
  intro(showWelcomeScreen());
  await runMillionWizard();
  outro(`${bold(green('✓ '))} You're all set!`);
}

main().catch(() => {
  abort(
    'Failed to setup Million.js, refer to the docs for manual setup: https://million.dev/docs/install',
  );
});

function showWelcomeScreen(): string {
  const text = magenta(`⚡ Million.js ${process.env.VERSION || ''}`);
  return text;
}
