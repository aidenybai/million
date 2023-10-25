/**
 * @fileoverview Tests for avoiding-Non-Deterministic-Returns
 */

'use strict';

// -----------------------------------------------------------------------------
// Requirements
// -----------------------------------------------------------------------------

const RuleTester = require('eslint').RuleTester;
const rule = require('../../../lib/rules/avoid-non-deterministic-returns');
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

ruleTester.run('avoid-non-deterministic-returns', rule, {
  valid: parsers.all([
    {
        code: ` 
            const Component = block(() => {
                const [count, setCount] = useState(initial.count);
            
                return (
                    <div>Count is {count}.</div>
                )
            })
        `,
    },
  ]),

  invalid: parsers.all([
    {
        code: ` 
            const Component = block(() => {
                const [count, setCount] = useState(initial.count);
            
                if (count > 10) {
                return <div>Too many clicks!</div>; 
                }
            })
        `,
        errors: [{
            message:"[Million.js] Conditional expressions will degrade performance. We recommend using deterministic returns instead.",
            type: "BlockStatement",
        }],

    },
    {
        code: ` 
            const Component = block(() => {
                const [count, setCount] = useState(initial.count);
            
                return count > 5 ? (
                'Count is greater than 5'
                ) : (
                <div>Count is {count}.</div>
                );
            })
        `,
        errors: [{
            message:"[Million.js] Conditional expressions will degrade performance. We recommend using deterministic returns instead.",
            type: "ConditionalExpression",
        }],

    },
  ]),

});
