const isBlockFunction = require("../utils/isBlockFunction.js");

/**
 * @fileoverview This ensures that returns must be deterministic. There can only be one return statement at the end of the block that returns a stable tree
 * @author Drex
 */
("use strict");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Ensures that returns must be deterministic. There can only be one return statement at the end of the block that returns a stable tree.",
      category: "Best Practices",
      recommended: true,
    },
    schema: [],
  },

  create: function (context) {
    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    function checkSingleReturnStatement(node) {
      if (isBlockFunction(node)) {
        const blockFunctionBody = node.arguments[0].body;

        let returnCount = 0;
        let hasConditionalReturn = false;

        const traverse = (currentNode) => {
          if (currentNode.type === "ReturnStatement") {
            returnCount++;
          } else if (
            currentNode.type === "ConditionalExpression" ||
            currentNode.type === "IfStatement" ||
            currentNode.type === "SwitchStatement"
          ) {
            hasConditionalReturn = true;
          } else if (currentNode.body) {
            if (Array.isArray(currentNode.body)) {
              currentNode.body.forEach(traverse);
            } else {
              traverse(currentNode.body);
            }
          }
        };

        traverse(blockFunctionBody);

        if (returnCount > 1 || hasConditionalReturn) {
          context.report({
            node: blockFunctionBody,
            message:
              "Inside the block function, there should only be one non-conditional return statement.",
          });
        }
      }
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      CallExpression: checkSingleReturnStatement,
    };
  },
};
