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
        const blockFunctionBody = node.arguments[0]?.body;

        let returnCount = 0;
        let hasConditionalReturn = false;

        const traverse = (currentNode) => {
          if (currentNode?.type === "ReturnStatement") {
            returnCount++;
          } else if (
            currentNode?.type === "ConditionalExpression" ||
            currentNode?.type === "IfStatement" ||
            currentNode?.type === "SwitchStatement"
          ) {
            hasConditionalReturn = true;
          } else if (currentNode?.body) {
            if (Array.isArray(currentNode.body)) {
              currentNode?.body.forEach(traverse);
            } else {
              traverse(currentNode?.body);
            }
          }
        };

        traverse(blockFunctionBody);

        if (returnCount > 1 || hasConditionalReturn) {
          context.report({
            node: blockFunctionBody,
            message:
            "[Million.js] Conditional expressions will degrade performance. We recommend using deterministic returns instead.",
          });
        }
      }
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      CallExpression: checkSingleReturnStatement,
      ConditionalExpression(node) {
        context.report({
          node,
          message:
            "[Million.js] Conditional expressions will degrade performance. We recommend using deterministic returns instead.",
        });
      },
    };
  },
};
