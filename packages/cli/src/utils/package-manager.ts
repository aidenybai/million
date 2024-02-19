import { exec } from 'node:child_process';
import * as path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { detect } from '@antfu/ni';
import * as clack from '@clack/prompts';
import { bold, cyan, dim, red } from 'kleur/colors';
import type { PackageManager } from '../types';
import { abort, abortIfCancelled } from './utils';
import { npm, pnpm, yarn, bun, packageManagers } from './constants';
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
  flag = ''
): void {
  exec(`${packageManager.installCommand} ${packageName}@latest ${flag}`);
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
    `${bold(detectedPackageManager?.label || 'No package manager')} detected.`
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
          hint: `Be sure you have ${bold(packageManager.label)} installed.`,
        })),
      })
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
        message: `The ${bold(
          cyan(packageName)
        )} package is already installed. Do you want to update it to the latest version?`,
      })
    );

    if (!shouldUpdatePackage) {
      return;
    }
  }

  const packageManager = await getPackageManager();

  const s = clack.spinner();
  s.start(
    `${alreadyInstalled ? 'Updating' : 'Installing'} ${bold(
      cyan(packageName)
    )} with ${bold(packageManager.label)}.`
  );

  try {
    installPackageWithPackageManager(packageManager, packageName);

    await sleep(1000);

    const installed = await isPackageInstalled();

    if (!installed) {
      s.stop();

      const shouldUseLegacyPeerDeps = await clack.confirm({
        message: `The ${bold(
          cyan(packageName)
        )} package did not install, would you like to use the "--legacy-peer-deps" flag?`,
      });

      if (!shouldUseLegacyPeerDeps) {
        throw new Error(
          'Please try again  or refer docs to install manually: https://million.dev/docs/install'
        );
      }

      installPackageWithPackageManager(
        packageManager,
        packageName,
        '--legacy-peer-deps'
      );

      s.start(
        `${alreadyInstalled ? 'Updating' : 'Installing'} ${bold(
          cyan(packageName)
        )} with ${bold(
          packageManager.label
        )} and the "--legacy-peer-deps" flag.`
      );

      await sleep(1000);
    }

    s.stop(
      `${alreadyInstalled ? 'Updated' : 'Installed'} ${bold(
        cyan(packageName)
      )} with ${bold(packageManager.label)}.`
    );
  } catch (e) {
    clack.log.error(
      `${red('Error during installation.')}\n\n${dim(
        'Please try again or refer docs to install manually: https://million.dev/docs/install'
      )}`
    );
    s.stop('Installation failed.');
    return abort();
  }
}
