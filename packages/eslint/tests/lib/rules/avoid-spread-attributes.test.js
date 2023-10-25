/**
 * @fileoverview Tests for Avoiding Spread Attributes
 */

'use strict';

// -----------------------------------------------------------------------------
// Requirements
// -----------------------------------------------------------------------------

const RuleTester = require('eslint').RuleTester;
const rule = require('../../../lib/rules/avoid-spread-attributes');
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
    message: "You can't use spread attributes inside of a component that is wrapped with a block function, as they can introduce non-deterministic returns.",
    type: "JSXSpreadAttribute",
}

ruleTester.run('avoid-spread-attributes', rule, {
  valid: parsers.all([
    {
        code: ` 
            const Item = block(() => {})

            const App = (props) => {
                return (
                    <>
                        <Item {...props} />
                    </>
                )
            }
        `,
    },
  ]),

  invalid: parsers.all([
    {
        code: ` 
            const Item = () => {}
            const App = block((props) => {
                return (
                    <>
                        <Item {...props} />
                    </>
                )
            })
        `,
        errors: [expectedError],

    },
  ]),

});
