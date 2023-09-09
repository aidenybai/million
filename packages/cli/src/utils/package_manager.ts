import { exec } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as clack from '@clack/prompts'
import { PackageManager } from '../types'
import { abort, abortIfCancelled } from './clack_utils'
import chalk from 'chalk'
import { setTimeout as sleep } from 'node:timers/promises'

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
  const s = clack.spinner()
  s.start('Detecting package manager.')

  const detectedPackageManager = detectPackageManger()
  await sleep(1000)
  s.stop(chalk.bold(detectedPackageManager?.label || 'Nothing') + ' detected.')

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
    const shouldUpdatePackage = await abortIfCancelled(
      clack.confirm({
        message: `The ${chalk.bold.cyan(
          packageName,
        )} package is already installed. Do you want to update it to the latest version?`,
      }),
    )

    if (!shouldUpdatePackage) {
      return
    }
  }

  const packageManager = await getPackageManager()

  const s = clack.spinner()
  s.start(
    `${alreadyInstalled ? 'Updating' : 'Installing'} ${chalk.bold.cyan(packageName)} with ${chalk.bold(
      packageManager.label,
    )}.`,
  )

  try {
    await installPackageWithPackageManager(packageManager, packageName)

    await sleep(1000)
    s.stop(
      `${alreadyInstalled ? 'Updated' : 'Installed'} ${chalk.bold.cyan(packageName)} with ${chalk.bold(
        packageManager.label,
      )}.`,
    )
  } catch (e) {
    clack.log.error(
      `${chalk.red('Encountered the following error during installation:')}\n\n${e}\n\n${chalk.dim(
        'Please try again and refer https://million.dev/docs/install#use-the-compiler',
      )}`,
    )
    s.stop('Installation failed.')
    await abort()
  }
}
