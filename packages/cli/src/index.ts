#! /usr/bin/env node

import { intro, outro } from '@clack/prompts';
import chalk from 'chalk';
import { installPackage } from './utils/package-manager.js';
import { abort } from './utils/utils.js';
import { handleConfigFile } from './utils/config.js';
import { isPackageInstalled } from './utils/package-json.js';

async function runMillionWizard({
  telemetry,
}: {
  telemetry: boolean;
}): Promise<void> {
  const isMillionAlreadyInstalled = await isPackageInstalled();
  await installPackage({
    packageName: 'million',
    alreadyInstalled: isMillionAlreadyInstalled,
  });
  await handleConfigFile({ telemetry });
}

const TELEMETRY_ENABLED = !process.argv.includes('--no-telemetry');

async function main() {
  intro(showWelcomeScreen());
  await runMillionWizard({ telemetry: TELEMETRY_ENABLED });
  outro(`${chalk.bold.green('✓ ')} You're all set!`);
}

main().catch(() => {
  abort(
    'Failed to setup Million.js, refer to the docs for manual setup: https://million.dev/docs/install',
  );
});

function showWelcomeScreen() {
  const text = chalk.magentaBright(
    `⚡ Million.js ${process.env.VERSION || ''}`,
  );
  return text;
}
