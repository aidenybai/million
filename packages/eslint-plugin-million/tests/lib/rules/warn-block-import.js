'use strict';

const rule = require('../../../lib/rules/warn-block-call'),
  RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester();

ruleTester.run('warn-block-call', rule, {
  valid: [
    {
      code: `import { block } from 'million/react';`,
    },
  ],
  // 'invalid' checks cases that should not pass
  invalid: [
    {
      code: "import { block } from 'million';",
      output: `import { block } from 'million/react';`,
      errors: 1,
    },
  ],
});
