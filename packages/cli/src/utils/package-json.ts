import * as fs from 'node:fs';
import * as path from 'node:path';
import * as clack from '@clack/prompts';
import type { PackageDotJson } from '../types';
import { abort } from './utils';

/**
 * Get the package.json dependencies and devDependencies
 */
export async function getPackageDotJson(): Promise<PackageDotJson> {
  const packageJsonFileContents = await fs.promises
    .readFile(path.join(process.cwd(), 'package.json'), 'utf8')
    .catch(() => {
      clack.log.error(
        'Could not find package.json. Make sure to run the wizard in the root of your app!',
      );
      return abort();
    });

  let packageJson: PackageDotJson | undefined;

  try {
    packageJson = JSON.parse(packageJsonFileContents);
  } catch {
    clack.log.error(
      'Unable to parse your package.json. Make sure it has a valid format!',
    );
    abort();
  }

  return packageJson || {};
}

/**
 * Check if the million package is installed (either present in dependencies or devDependencies)
 */
export async function isPackageInstalled(): Promise<boolean> {
  const packageJson = await getPackageDotJson();
  if (packageJson.dependencies?.million) {
    return true;
  }
  return false;
}
