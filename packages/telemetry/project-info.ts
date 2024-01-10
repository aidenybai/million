import { execSync } from 'node:child_process';
import type { BinaryLike } from 'node:crypto';
import { createHash } from 'node:crypto';
import { detectPackageManager } from './utils/detect-package-manager';

export interface ProjectInfo {
  anonymousProjectId: string | undefined;
  isGit: boolean;
  packageManager: string | undefined;
  packageManagerVersion: string | undefined;
}

const createAnonymousValue = (payload: BinaryLike): string => {
  if (payload === '') {
    return payload;
  }
  const hash = createHash('sha256');
  hash.update(payload);
  return hash.digest('hex');
};

const getProjectIdFromGit = (): string | null => {
  try {
    const originBuffer = execSync(`git rev-list --max-parents=0 HEAD`, {
      timeout: 500,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return String(originBuffer).trim();
  } catch (_) {
    return null;
  }
};

const getProjectId = (
  isCI: boolean,
): Pick<ProjectInfo, 'anonymousProjectId' | 'isGit'> => {
  const projectIdFromGit = getProjectIdFromGit();
  if (projectIdFromGit) {
    return {
      isGit: true,
      anonymousProjectId: createAnonymousValue(projectIdFromGit),
    };
  }
  // If we're running in CI, the current working directory is not unique.
  // If the cwd is a single level deep (ex: '/app'), it's probably not unique.
  const cwd = process.cwd();
  const isCwdGeneric = (cwd.match(/[/|\\]/g) || []).length === 1;
  if (isCI || isCwdGeneric) {
    return {
      isGit: false,
      anonymousProjectId: undefined,
    };
  }
  return {
    isGit: false,
    anonymousProjectId: createAnonymousValue(cwd),
  };
};

export const getProjectInfo = (isCI: boolean): ProjectInfo => {
  const projectId = getProjectId(isCI);
  const packageManager = detectPackageManager();
  return {
    ...projectId,
    packageManager: packageManager?.name,
    packageManagerVersion: packageManager?.version,
  };
};
