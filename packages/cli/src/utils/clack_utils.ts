import * as clack from '@clack/prompts'
import * as fs from 'fs'
import chalk from 'chalk'

export async function abortIfCancelled<T>(input: T | Promise<T>): Promise<Exclude<T, symbol>> {
  if (clack.isCancel(await input)) {
    clack.cancel('Million setup cancelled.')
    process.exit(0)
  } else {
    return input as Exclude<T, symbol>
  }
}

export async function abort(message?: string, status?: number): Promise<never> {
  clack.outro(
    message ??
      chalk.red('Setup failed.') + `\nReport a bug at ${chalk.cyan('https://github.com/aidenybai/million/issues')}`,
  )
  return process.exit(status ?? 1)
}

export function getNextRouter() {
  if (fs.existsSync('src/app') || fs.existsSync('app')) {
    return 'app'
  } else if (fs.existsSync('src/pages') || fs.existsSync('pages')) {
    return 'pages'
  } else {
    return undefined
  }
}
