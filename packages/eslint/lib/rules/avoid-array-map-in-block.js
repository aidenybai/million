const isBlockFunction = require("../utils/isBlockFunction.js");

/**
 * @fileoverview This recommends removing the block on the current component and using a <For /> component instead.
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
        "Array.map() will degrade performance. We recommend removing the block on the current component and using a <For /> component instead.",
      category: "Best Practices",
      recommended: true,
    },
    schema: [],
  },

  create: function (context) {
    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    function checkForArrayMap(node) {
      if (
        node.type === "CallExpression" &&
        node.callee.property &&
        node.callee.property.name === "map"
      ) {
        const ancestors = context.getAncestors(node);
        for (const ancestor of ancestors) {
          if (isBlockFunction(ancestor)) {
            context.report({
              node: node,
              message:
                "Array.map() will degrade performance. We recommend removing the block on the current component and using a <For /> component instead.",
            });
            break;
          }
        }
      }
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      CallExpression: checkForArrayMap,
    };
  },
};
