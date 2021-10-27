import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  testEnvironment: 'jsdom',
  collectCoverage: true,
  maxWorkers: '50%',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc-node/jest',
  },
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!src/**/index.*',
    '!src/**/types/*',
    '!src/**/schedule.ts',
    '!src/**/jsx.ts',
    '!src/**/patch.ts',
    '!src/**/drivers/*',
  ],
};

export default config;
