"use strict";

const rule = require("../../../lib/rules/warn-conditional-expressions"),
    RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester();

ruleTester.run("warn-conditional-expressions", rule, {
    valid: [],
    invalid: [{
        code: `return count > 5 ? (
                    'Count is greater than 5'
                ) : (
                    <div>Count is {count}.</div>
                );`,
        errors: [{
            suggestions: [{
                desc: "Conditional expressions will degrade performance. We recommend using deterministic returns instead.",
                output: `if (count > 5) {
                            return 'Count is greater than 5';
                        } else {
                            return <div>Count is {count}.</div>;
                        }`
            }]
        }]
    }]
})