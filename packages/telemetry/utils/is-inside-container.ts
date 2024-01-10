import fs from 'node:fs';
import { isDocker } from './is-docker';

let cachedResult: boolean | undefined;

const hasContainerEnv = (): boolean => {
  try {
    fs.statSync('/run/.containerenv');
    return true;
  } catch {
    return false;
  }
};

export const isInsideContainer = (): boolean => {
  if (cachedResult === undefined) {
    cachedResult = hasContainerEnv() || isDocker();
  }

  return cachedResult;
};
