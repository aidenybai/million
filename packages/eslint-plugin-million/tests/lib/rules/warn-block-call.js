"use strict";

const rule = require("../../../lib/rules/warn-block-call"),
    RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester();

ruleTester.run("warn-block-call", rule, {
    valid: [{
      code: `const GoodBlock = block(App)`,
    }],
    // 'invalid' checks cases that should not pass
    invalid: [{
      code: "const BadBlock = block(<Component />)",
      output: `const GoodBlock = block(App)`,
      errors: 1,
    }],
})