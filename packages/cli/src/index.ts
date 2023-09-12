#! /usr/bin/env node

import { intro, outro } from '@clack/prompts'
import chalk from 'chalk'
import gradient from 'gradient-string'
import { installPackage } from './utils/package_manager.js'
import { abort } from './utils/utils.js'
import { handleConfigFile } from './utils/config.js'
import { isPackageInstalled } from './utils/package_json.js'

async function runMillionWizard(): Promise<void> {
  const isMillionAlreadyInstalled = await isPackageInstalled()
  await installPackage({ packageName: 'million', alreadyInstalled: isMillionAlreadyInstalled })
  await handleConfigFile()
}

async function main() {
  console.log() // empty line

  intro(showWelcomeScreen())
  await runMillionWizard()
  outro(chalk.bold.green('✓ ') + "You're all set!")
}

main().catch((err) => {
  console.log(err)
  abort('Failed to setup million: refer docs https://million.dev/docs/install#use-the-compiler for manual setup.')
})

function showWelcomeScreen() {
  const textGradient = gradient('#0099F7', '#ff3432')
  const text = `${chalk.bold(textGradient('        Welcome to Million js Wizard.'))}\n
  ${textGradient('Configure million js to your codebase with ease.')}`
  return text
}
