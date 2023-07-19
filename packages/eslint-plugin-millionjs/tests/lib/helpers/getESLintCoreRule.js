'use strict';

const version = require('eslint/package.json').version;
const semver = require('semver');

const isESLintV8 = semver.major(version) >= 8;

// eslint-disable-next-line global-require, import/no-dynamic-require, import/no-unresolved
const getESLintCoreRule = (ruleId) => (isESLintV8 ? require('eslint/use-at-your-own-risk').builtinRules.get(ruleId) : require(`eslint/lib/rules/${ruleId}`));

module.exports = getESLintCoreRule;
