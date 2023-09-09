#! /usr/bin/env node

import { intro } from '@clack/prompts'
import chalk from 'chalk'
import gradient from 'gradient-string'
import { installPackage } from './utils/package_manager.js'
import { abort } from './utils/clack_utils.js'

async function runMillionWizard(): Promise<void> {
  await installPackage('million')
}

async function main() {
  console.log() // empty line

  intro(showWelcomeScreen())
  await runMillionWizard()
}

main().catch((err) => {
  console.log(err)
  abort()
})

function showWelcomeScreen() {
  const textGradient = gradient('#0099F7', '#ff3432')
  const text = `${chalk.bold(textGradient('        Welcome to Million js Wizard.'))}\n
  ${textGradient('Configure million js to your codebase with ease.')}`
  return text
}
