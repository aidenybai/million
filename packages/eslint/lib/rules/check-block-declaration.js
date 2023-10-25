const isBlockFunction = require("../utils/isBlockFunction.js");

/**
 * @fileoverview This Requires block to be used in variable declaration
 * @author Drex
 */
("use strict");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: "suggestion", // `problem`, `suggestion`, or `layout`
    docs: {
      description: "Require block to be used in variable declaration",
      category: "Best Practices",
      recommended: true,
    },
    schema: [], // Add a schema if the rule has options
  },

  create: function (context) {
    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    function checkBlockDeclaration(node) {
      if (isBlockFunction(node)) {
        const parent = node.parent;
        console.log(node, 'nodeeeee', parent, 'parenttt')

        if (!parent || parent.type !== "VariableDeclarator") {
          context.report({
            node: node,
            message: "block must be used in a variable declaration.",
          });
        }
      }
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      CallExpression: checkBlockDeclaration,
    };
  },
};
