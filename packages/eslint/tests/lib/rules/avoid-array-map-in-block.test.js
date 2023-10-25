/**
 * @fileoverview Tests for Avoiding-Array-Map-In-Block
 */

'use strict';

// -----------------------------------------------------------------------------
// Requirements
// -----------------------------------------------------------------------------

const RuleTester = require('eslint').RuleTester;
const rule = require('../../../lib/rules/avoid-array-map-in-block');
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
    message:  "Array.map() will degrade performance. We recommend removing the block on the current component and using a <For /> component instead.",
    type: "CallExpression",
}

ruleTester.run('avoid-array-map-in-block', rule, {
  valid: parsers.all([
    {
        code: ` 
        const App = block(() => {
            const items = []

            return (
               <>
                    <For each={items}>
                        {(item) => <div key={item}>{item}</div>}
                    </For>
               </>
            )
        })
        
            `,
    },
  ]),

  invalid: parsers.all([
    {
        code: ` 
            const App = block(() => {
                const items = []

                return (
                    <div>
                        {items.map((item) => (
                            <div key={item}>{item}</div>
                        ))}
                    </div>
                )
            })
            `,
        errors: [expectedError],

    },
  ]),

});
