module.exports = {
  collectCoverage: true,
  maxWorkers: '50%',
  transform: {
    '.(ts)': 'ts-jest',
  },
  collectCoverageFrom: [
    "<rootDir>/src/**/*.ts",
    '!src/**/index.*',
    '!src/**/constants.ts',
    '!src/**/structs.ts',
  ]
};
