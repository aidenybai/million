'use strict';

const rule = require('../../../lib/rules/warn-array-maps'),
  RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester();

ruleTester.run('warn-array-maps', rule, {
  valid: [],
  invalid: [
    {
      code: 'Array.map(item => <li>{item}</li>)',
      errors: [
        {
          suggestions: [
            {
              desc: 'Array.map() will degrade performance. We recommend removing the block on the current component and using a <For /> component instead.',
              output: '<For each={items}>{(item) => <li>{item}</li>}</For>',
            },
          ],
        },
      ],
    },
  ],
});
