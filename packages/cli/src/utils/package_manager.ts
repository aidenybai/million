import { exec } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as clack from '@clack/prompts'
import { PackageManager } from '../types'
import { abort, abortIfCancelled } from './clack_utils'
import chalk from 'chalk'

const yarn: PackageManager = {
  name: 'yarn',
  label: 'Yarn',
  lockFile: 'yarn.lock',
  installCommand: 'yarn add',
  buildCommand: 'yarn build',
}
const pnpm: PackageManager = {
  name: 'pnpm',
  label: 'PNPM',
  lockFile: 'pnpm-lock.yaml',
  installCommand: 'pnpm install',
  buildCommand: 'pnpm build',
}
const npm: PackageManager = {
  name: 'npm',
  label: 'NPM',
  lockFile: 'package-lock.json',
  installCommand: 'npm install',
  buildCommand: 'npm run build',
}

export const packageManagers = [yarn, pnpm, npm]

export function detectPackageManger(): PackageManager | null {
  for (const packageManager of packageManagers) {
    if (fs.existsSync(path.join(process.cwd(), packageManager.lockFile))) {
      return packageManager
    }
  }
  return null
}

export async function installPackageWithPackageManager(
  packageManager: PackageManager,
  packageName: string,
): Promise<void> {
  await exec(`${packageManager.installCommand} ${packageName}`)
}

async function getPackageManager(): Promise<PackageManager> {
  const detectedPackageManager = detectPackageManger()

  if (detectedPackageManager) {
    return detectedPackageManager
  }

  const selectedPackageManager: PackageManager | symbol = await abortIfCancelled(
    clack.select({
      message: 'Please select your package manager.',
      options: packageManagers.map((packageManager) => ({
        value: packageManager,
        label: packageManager.label,
      })),
    }),
  )

  return selectedPackageManager
}

export async function installPackage({
  packageName,
  alreadyInstalled,
  askBeforeUpdating = true,
}: {
  packageName: string
  alreadyInstalled: boolean
  askBeforeUpdating?: boolean
}): Promise<void> {
  if (alreadyInstalled && askBeforeUpdating) {
    const shouldUpdatePackage = await clack.confirm({
      message: `The ${chalk.bold.cyan(
        packageName,
      )} package is already installed. Do you want to update it to the latest version?`,
    })

    if (shouldUpdatePackage == false) {
      return
    }
  }

  const pkgInstallSpinner = clack.spinner()

  const packageManager = await getPackageManager()

  pkgInstallSpinner.start(
    `${alreadyInstalled ? 'Updating' : 'Installing'} ${chalk.bold.cyan(packageName)} with ${chalk.bold(
      packageManager.label,
    )}.`,
  )

  try {
    await installPackageWithPackageManager(packageManager, packageName)
  } catch (e) {
    pkgInstallSpinner.stop('Installation failed.')
    clack.log.error(
      `${chalk.red('Encountered the following error during installation:')}\n\n${e}\n\n${chalk.dim(
        'If you think this issue is caused by the Sentry wizard, let us know here:\nhttps://github.com/getsentry/sentry-wizard/issues',
      )}`,
    )
    await abort()
  }

  pkgInstallSpinner.stop(
    `${alreadyInstalled ? 'Updated' : 'Installed'} ${chalk.bold.cyan(packageName)} with ${chalk.bold(
      packageManager.label,
    )}.`,
  )
}
