/**
 * @fileoverview This makes sure that the block function is being imported from the million/react package
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
        "[Million.js] Found unsupported import for block. Make sure blocks are imported from million/react.",
      category: "Best Practices",
      recommended: true,
    },
    schema: [],
  },

  create: function (context) {
    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    function isBlockImport(node) {
      return (
        node.type === "ImportSpecifier" &&
        node.imported.name === "block" &&
        node.parent.source.value === "million"
      );
    }

    function checkCorrectBlockImport(node) {
      if (isBlockImport(node)) {
        context.report({
          node,
          message:
            "[Million.js] Found unsupported import for block. Make sure blocks are imported from million/react.",
        });
      }
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      ImportSpecifier: checkCorrectBlockImport,
    };
  },
};
