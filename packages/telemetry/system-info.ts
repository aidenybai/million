import os from 'node:os';
import { getCI, isCI } from './utils/is-ci';
import { isWSL } from './utils/is-wsl';
import { isDocker } from './utils/is-docker';

export interface SystemInfo {
  systemPlatform: NodeJS.Platform;
  systemRelease: string;
  systemArchitecture: string;
  nodeVersion: string;
  cpuCount: number;
  cpuModel: string | null;
  cpuSpeed: number | null;
  memoryInMb: number;
  isDocker: boolean;
  isWSL: boolean;
  isCI: boolean;
  ciName: string | null;
}

let meta: SystemInfo | undefined;

export const getSystemInfo = (): SystemInfo => {
  if (meta) {
    return meta;
  }

  const cpus = os.cpus();

  meta = {
    // Version information
    nodeVersion: process.version.replace(/^v?/, ''),
    // Software information
    systemPlatform: os.platform(),
    systemRelease: os.release(),
    systemArchitecture: os.arch(),
    // Machine information
    cpuCount: cpus.length,
    cpuModel: cpus.length ? cpus[0]!.model : null,
    cpuSpeed: cpus.length ? cpus[0]!.speed : null,
    memoryInMb: Math.trunc(os.totalmem() / Math.pow(1024, 2)),
    // Environment information
    isDocker: isDocker(),
    isWSL: isWSL(),
    isCI,
    ciName: getCI(),
  };

  return meta;
};
