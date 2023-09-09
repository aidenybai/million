#! /usr/bin/env node

import { intro, outro } from '@clack/prompts'
import chalk from 'chalk'
import gradient from 'gradient-string'
import { installPackage } from './utils/package_manager.js'
import { abort } from './utils/clack_utils.js'
import { createConfigFile } from './utils/config.js'
import { isPackageInstalled } from './utils/package_json.js'

async function runMillionWizard(): Promise<void> {
  const isMillionAlreadyInstalled = await isPackageInstalled()
  await installPackage({ packageName: 'million@latest', alreadyInstalled: isMillionAlreadyInstalled })
  await createConfigFile()
}

async function main() {
  console.log() // empty line

  intro(showWelcomeScreen())
  await runMillionWizard()
  outro("That's it! You're all set up.")
}

main().catch((err) => {
  console.log(err)
  abort('Failed to setup million: refer docs https://million.dev/docs/install#use-the-compiler')
})

function showWelcomeScreen() {
  const textGradient = gradient('#0099F7', '#ff3432')
  const text = `${chalk.bold(textGradient('        Welcome to Million js Wizard.'))}\n
  ${textGradient('Configure million js to your codebase with ease.')}`
  return text
}
