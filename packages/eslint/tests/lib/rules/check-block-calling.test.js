/**
 * @fileoverview Tests for check-block-calling
 */

'use strict';

// -----------------------------------------------------------------------------
// Requirements
// -----------------------------------------------------------------------------

const RuleTester = require('eslint').RuleTester;
const rule = require('../../../lib/rules/check-block-calling');
const parsers = require('../helpers/parsers');

const parserOptions = {
  ecmaVersion: 2018,
  sourceType: 'module',
  ecmaFeatures: {
    jsx: true,
  },
};

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

const ruleTester = new RuleTester({ parserOptions });
const expectedError =  {
    message: "Found unsupported argument for block. Make sure blocks consume a reference to a component function or the direct declaration.",
    type: "CallExpression",
}

ruleTester.run('check-block-declaration', rule, {
  valid: parsers.all([
    {
        code: "const GoodBlock = block(App)",
    },
  ]),

  invalid: parsers.all([
    {
        code: "const BadBlock = block(<Component />);",
        errors: [expectedError],
    },
  ]),
});
