/**
 * @fileoverview Tests for Validating the Block Import
 */

'use strict';

// -----------------------------------------------------------------------------
// Requirements
// -----------------------------------------------------------------------------

const RuleTester = require('eslint').RuleTester;
const rule = require('../../../lib/rules/validate-block-import');

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
    message: "[Million.js] Found unsupported import for block. Make sure blocks are imported from million/react.",
    type: "ImportSpecifier",
}

ruleTester.run('check-block-import', rule, {
  valid: parsers.all([
    {
        code: "import {block} from 'million/react'",
    },
  ]),

  invalid: parsers.all([
    {
        code: "import {block} from 'million'",
        errors: [expectedError],
    },
    {
        code: "import {block} from 'millions'",
        errors: [expectedError],
    },
    {
        code: "import {block} from 'millions/react'",
        errors: [expectedError],
    },
   
  ]),
});
