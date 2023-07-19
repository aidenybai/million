'use strict';

const configAll = require('./configs/all');
const configRecommended = require('./configs/recommended');
const configRuntime = require('./configs/jsx-runtime');

const allRules = require('./lib/rules/index');

// for legacy config system
const plugins = [
  'react',
];

module.exports = {
//   deprecatedRules: configAll.plugins.react.deprecatedRules,
  rules: allRules,
  configs: {
    recommended: Object.assign({}, configRecommended, {
      parserOptions: configRecommended.languageOptions.parserOptions,
      plugins,
    }),
    all: Object.assign({}, configAll, {
      parserOptions: configAll.languageOptions.parserOptions,
      plugins,
    }),
    'jsx-runtime': Object.assign({}, configRuntime, {
      parserOptions: configRuntime.languageOptions.parserOptions,
      plugins,
    }),
  },
};
