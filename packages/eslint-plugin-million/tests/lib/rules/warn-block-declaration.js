"use strict";

const rule = require("../../../lib/rules/warn-block-declaration"),
    RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester();

ruleTester.run("warn-block-declaration", rule, {
    valid: [{
      code: `const Block = block(() => <div />);
            console.log(Block);`,
    }],
    // 'invalid' checks cases that should not pass
    invalid: [{
      code: "console.log(block(() => <div />))",
      output: `const Block = block(() => <div />);
              console.log(Block);`,
      errors: 1,
    }],
})