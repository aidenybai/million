/**
 * @fileoverview Tests for check-block-declaration
 */

'use strict';

// -----------------------------------------------------------------------------
// Requirements
// -----------------------------------------------------------------------------

const RuleTester = require('eslint').RuleTester;
const rule = require('../../../lib/rules/check-block-declaration');

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
    message: "block must be used in a variable declaration.",
    type: "CallExpression",
}

ruleTester.run('check-block-declaration', rule, {
  valid: parsers.all([
    {
        code: "const Block = block(() => <div />);",
    },
    {
        code: "const Block = block(() => { return <div />; });",
    },
    {
        code: "const Block = () => { return <div />; };",
    },
   
   
  ]),

  invalid: parsers.all([
    {
        code: "block(() => <div />);",
        errors: [expectedError],
    },
    {
        code: "block(() => { return <div />; });",
        errors: [expectedError],
    },
    {
        code: "console.log(block(() => <div />));",
        errors: [expectedError],
    },
   
  ]),
});
