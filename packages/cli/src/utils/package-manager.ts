import { exec } from 'child_process';
import * as path from 'path';
import { setTimeout as sleep } from 'node:timers/promises';
import { detect } from '@antfu/ni';
import * as clack from '@clack/prompts';
import chalk from 'chalk';
import { abort, abortIfCancelled } from './utils';
import { npm, pnpm, yarn, bun, packageManagers } from './constants';
import type { PackageManager } from '../types';
import { isPackageInstalled } from './package-json';

/**
 * Detect package manager by checking if the lock file exists.
 */
export async function detectPackageManger(): Promise<PackageManager | null> {
  const packageManager = await detect({
    programmatic: true,
    cwd: path.join(process.cwd()),
  });

  switch (packageManager) {
    case 'yarn':
      return yarn;
    case 'pnpm':
      return pnpm;
    case 'npm':
      return npm;
    case 'bun':
      return bun;
    default:
      return null;
  }
}

/**
 * Install package with package manager. (execute install command)
 */
export function installPackageWithPackageManager(
  packageManager: PackageManager,
  packageName: string,
): void {
  exec(`${packageManager.installCommand} ${packageName}@latest`);
}

/**
 * Get the package manager to use.
 * If the package manager is not detected, ask the user to select one.
 */
async function getPackageManager(): Promise<PackageManager> {
  const s = clack.spinner();
  s.start('Detecting package manager.');

  const detectedPackageManager = await detectPackageManger();
  await sleep(1000);
  s.stop(
    `${chalk.bold(
      detectedPackageManager?.label || 'No package manager',
    )} detected.`,
  );

  if (detectedPackageManager) {
    return detectedPackageManager;
  }

  const selectedPackageManager: PackageManager | symbol =
    await abortIfCancelled(
      clack.select({
        message: 'Please select your package manager.',
        options: packageManagers.map((packageManager) => ({
          value: packageManager,
          label: packageManager.label,
          hint: `Be sure you have ${chalk.bold(
            packageManager.label,
          )} installed.`,
        })),
      }),
    );

  return selectedPackageManager;
}

/**
 * Install package with package manager.
 * If the package is already installed, ask the user if they want to update it.
 */
export async function installPackage({
  packageName,
  alreadyInstalled,
  askBeforeUpdating = true,
}: {
  packageName: string;
  alreadyInstalled: boolean;
  askBeforeUpdating?: boolean;
}): Promise<void> {
  if (alreadyInstalled && askBeforeUpdating) {
    const shouldUpdatePackage = await abortIfCancelled(
      clack.confirm({
        message: `The ${chalk.bold.cyan(
          packageName,
        )} package is already installed. Do you want to update it to the latest version?`,
      }),
    );

    if (!shouldUpdatePackage) {
      return;
    }
  }

  const packageManager = await getPackageManager();
  
  const s = clack.spinner();
  s.start(
    `${alreadyInstalled ? 'Updating' : 'Installing'} ${chalk.bold.cyan(
      packageName,
    )} with ${chalk.bold(packageManager.label)}.`,
  );

  try {
    installPackageWithPackageManager(packageManager, packageName);

    await sleep(1000);

    const installed = await isPackageInstalled()

    if(!installed) throw new Error('Please try again with the "--legacy-peer-deps" flag or refer docs to install manually: https://million.dev/docs/install')

    s.stop(
      `${alreadyInstalled ? 'Updated' : 'Installed'} ${chalk.bold.cyan(
        packageName,
      )} with ${chalk.bold(packageManager.label)}.`,
    );


  } catch (e) {
    clack.log.error(
      `${chalk.red('Error during installation.')}\n\n${chalk.dim(
        'Please try again or refer docs to install manually: https://million.dev/docs/install',
      )}`,
    );
    s.stop('Installation failed.');
    return abort();
  }
}
