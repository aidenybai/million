'use strict';

const fromEntries = require('object.fromentries');

const allRules = require('../lib/rules/index');


function configureAsError(rules) {
  return fromEntries(Object.keys(rules).map((key) => [`react/${key}`, 2]));
}

// const activeRules = filterRules(allRules, (rule) => !rule.meta.deprecated);
const activeRulesConfig = configureAsError(allRules);


module.exports = {
  plugins: {
    react: {
      rules: allRules,
    },
  },
  rules: activeRulesConfig,
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
};

// this is so the `languageOptions` property won't be warned in the new config system
Object.defineProperty(module.exports, 'languageOptions', { enumerable: false });
