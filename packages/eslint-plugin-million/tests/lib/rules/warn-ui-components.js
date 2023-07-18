"use strict";

const rule = require("../../../lib/rules/warn-ui-components"),
    RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester();

ruleTester.run("warn-ui-components", rule, {
    valid: [],
    invalid: [{
        code: `<Stack>
                <Text>What's up my fellow components</Text>
              </Stack>`,
        errors: [{
            suggestions: [{
                desc: "Components will cause degraded performance. Ideally, you should use DOM elements instead.",
                output: `<div>
                            <p>What's up my fellow components</p>
                        </div>`
            }]
        }]
    }]
})