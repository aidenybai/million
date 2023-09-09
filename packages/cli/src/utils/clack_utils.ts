import * as clack from '@clack/prompts'
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
  clack.outro(message ?? chalk.red('setup cancelled.'))
  return process.exit(status ?? 1)
}
