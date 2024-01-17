import fs from 'node:fs';

let isDockerCached: boolean | undefined;

const hasDockerEnv = (): boolean => {
  try {
    fs.statSync('/.dockerenv');
    return true;
  } catch {
    return false;
  }
};

const hasDockerCGroup = (): boolean => {
  try {
    return fs.readFileSync('/proc/self/cgroup', 'utf8').includes('docker');
  } catch {
    return false;
  }
};

export const isDocker = (): boolean => {
  if (isDockerCached === undefined) {
    isDockerCached = hasDockerEnv() || hasDockerCGroup();
  }

  return isDockerCached;
};
