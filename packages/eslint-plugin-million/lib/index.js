/**
 * @fileoverview Official ESLint plugin for millionjs
 * @author MillionJs
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const requireIndex = require('requireindex');

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

// import all rules in lib/rules
module.exports.rules = requireIndex(__dirname + '/rules');

//extend million recommended rules, this allows the recommended config rules to be loaded automatically

module.exports.config = {
  recommended: {
    rules: {
      'million/warn-block-import': 'error',
      'million/warn-block-declaration': 'error',
      'million/warn-block-call': 'error',
      'million/warn-array-map': 'error',
      'million/warn-conditional-expression': 'error',
      'million/warn-ui-components': 'error',
    },
  },
};
