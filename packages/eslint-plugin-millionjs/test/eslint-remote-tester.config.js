'use strict';

const eslintRemoteTesterRepositories = require('eslint-remote-tester-repositories');

module.exports = {
  repositories: eslintRemoteTesterRepositories.getRepositories({ randomize: true }),

  pathIgnorePattern: eslintRemoteTesterRepositories.getPathIgnorePattern(),

  extensions: ['js', 'jsx', 'ts', 'tsx'],

  concurrentTasks: 3,

  logLevel: 'info',

  /** Optional boolean flag used to enable caching of cloned repositories. For CIs it's ideal to disable caching. Defauls to true. */
  cache: false,

  eslintrc: {
    root: true,
    env: {
      es6: true,
    },
    overrides: [
      {
        files: ['*.ts', '*.tsx', '*.mts', '*.cts'],
        parser: '@typescript-eslint/parser',
      },
    ],
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    settings: {
      react: {
        version: '16.13.1',
      },
    },
    extends: ['plugin:react/all'],
  },
};
