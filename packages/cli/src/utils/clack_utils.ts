import * as clack from '@clack/prompts'

export async function abortIfCancelled<T>(input: T | Promise<T>): Promise<Exclude<T, symbol>> {
  if (clack.isCancel(await input)) {
    clack.cancel('million setup cancelled.')
    process.exit(0)
  } else {
    return input as Exclude<T, symbol>
  }
}

export async function abort(message?: string, status?: number): Promise<never> {
  clack.outro(message ?? 'setup cancelled.')
  return process.exit(status ?? 1)
}
