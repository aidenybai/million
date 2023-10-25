const isBlockFunction = require("../utils/isBlockFunction.js");

/**
 * @fileoverview This Makes sure blocks consume a reference to a component function or the direct declaration.
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
        "Found unsupported argument for block. Make sure blocks consume a reference to a component function or the direct declaration.",
      category: "Best Practices",
      recommended: true,
    },
    schema: [],
  },

  create: function (context) {
    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    function checkBlockArgument(node) {
      if (isBlockFunction(node)) {
        const argumentType = node.arguments[0].type;

        if (argumentType === "JSXElement") {
          context.report({
            node: node,
            message:
              "Found unsupported argument for block. Make sure blocks consume a reference to a component function or the direct declaration.",
          });
        }
      }
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      CallExpression: checkBlockArgument,
    };
  },
};
