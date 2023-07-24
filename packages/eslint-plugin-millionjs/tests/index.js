/* eslint-env mocha */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const plugin = require('../index');
const index = require('../lib/rules/index');

const ruleFiles = fs.readdirSync(path.resolve(__dirname, '../lib/rules/'))
  .map((f) => path.basename(f, '.js'))
  .filter((f) => f !== 'index');

describe('all rule files should be exported by the plugin', () => {
  ruleFiles.forEach((ruleName) => {
    it(`should export ${ruleName}`, () => {
      assert.equal(
        plugin.rules[ruleName],
        require(path.join('../lib/rules/', `${ruleName}.js`)) 
      );
    });

    it(`should export ${ruleName} from lib/rules/index`, () => {
      assert.equal(
        plugin.rules[ruleName],
        index[ruleName]
      );
    });
  });
});


describe('configurations', () => {
  it('should export a ‘recommended’ configuration', () => {
    const configName = 'recommended';
    assert(plugin.configs[configName]);

    Object.keys(plugin.configs[configName].rules).forEach((ruleName) => {
      assert.ok(ruleName.startsWith('millionjs/'));
    });

    ruleFiles.forEach((ruleName) => {
      const inRecommendedConfig = !!plugin.configs[configName].rules[`millionjs/${ruleName}`];
      const isRecommended = plugin.rules[ruleName].meta.docs[configName];
      if (inRecommendedConfig) {
        assert(isRecommended, `${ruleName} metadata should mark it as recommended`);
      } else {
        assert(!isRecommended, `${ruleName} metadata should not mark it as recommended`);
      }
    });
  });

  it('should export an ‘all’ configuration', () => {
    const configName = 'all';
    assert(plugin.configs[configName]);

    Object.keys(plugin.configs[configName].rules).forEach((ruleName) => {
      assert.ok(ruleName.startsWith('react/'));
      assert.equal(plugin.configs[configName].rules[ruleName], 2);
    })
  });

  it('should export a ‘jsx-runtime’ configuration', () => {
    const configName = 'jsx-runtime';
    assert(plugin.configs[configName]);

    Object.keys(plugin.configs[configName].rules).forEach((ruleName) => {
      assert.ok(ruleName.startsWith('react/'));
      assert.equal(plugin.configs[configName].rules[ruleName], 0);
    });
  });
});
