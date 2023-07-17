// const isBlockFunction = require("../utils/isBlockFunction.js");

// /**
//  * @fileoverview This Avoids the use of Spread attributes in a component that is wrapped with a block function, as they can introduce non-deterministic returns.
//  * @author Drex
//  */
// ("use strict");

// //------------------------------------------------------------------------------
// // Rule Definition
// //------------------------------------------------------------------------------

// module.exports = {
//   meta: {
//     type: "suggestion",
//     docs: {
//       description:
//         "You can't use spread attributes inside of a component that is wrapped with a block function, as they can introduce non-deterministic returns.",
//       category: "Best Practices",
//       recommended: true,
//     },
//     schema: [],
//   },

//   create: function (context) {
//     //----------------------------------------------------------------------
//     // Helpers
//     //----------------------------------------------------------------------

//     function hasSpreadAttribute(attributes) {
//       return (
//         attributes &&
//         attributes.some((attr) => attr.type === "JSXSpreadAttribute")
//       );
//     }

//     function checkAvoidSpreadAttributes(node) {
//       if (isBlockFunction(node)) {
//         const jsxElements = [];

//         traverse(node.arguments[0].body, jsxElements);

//         // Check for spread attributes outside the block-wrapped component
//         const spreadAttributesOutsideBlock = jsxElements.filter(
//           (jsxElement) => jsxElement !== node
//         );
//         spreadAttributesOutsideBlock.forEach((jsxElement) => {
//           if (hasSpreadAttribute(jsxElement.openingElement.attributes)) {
//             context.report({
//               node: jsxElement.openingElement,
//               message:
//                 "You can't use spread attributes inside of a component that is wrapped with a block function, as they can introduce non-deterministic returns.",
//             });
//           }
//         });
//       }
//     }

//     function traverse(currentNode, jsxElements) {
//       if (currentNode && currentNode.type === "JSXElement") {
//         jsxElements.push(currentNode);
//         if (
//           currentNode.openingElement &&
//           hasSpreadAttribute(currentNode.openingElement.attributes)
//         ) {
//           context.report({
//             node: currentNode.openingElement,
//             message:
//               "You can't use spread attributes inside of a component that is wrapped with a block function, as they can introduce non-deterministic returns.",
//           });
//         }
//         if (currentNode.children) {
//           currentNode.children.forEach((childNode) => {
//             traverse(childNode);
//           });
//         }
//       }
//     }

//     //----------------------------------------------------------------------
//     // Public
//     //----------------------------------------------------------------------

//     return {
//       CallExpression: checkAvoidSpreadAttributes,
//     };
//   },
// };

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "You can't use spread attributes inside of a component that is wrapped with a block function, as they can introduce non-deterministic returns.",
      category: "Best Practices",
      recommended: true,
    },
    schema: [],
  },

  create: function (context) {
    function isBlockFunction(node) {
      // Customize this condition to match your specific block function
      return (
        node.type === "CallExpression" &&
        node.callee.name === "block" &&
        node.arguments.length === 1 &&
        node.arguments[0].type === "ArrowFunctionExpression"
      );
    }

    // function hasSpreadAttribute(attributes) {
    //   console.log(attributes, "attr");

    //   return (
    //     attributes &&
    //     attributes.some((attr) => attr.type === "JSXSpreadAttribute")
    //   );
    // }

    function containsSpreadAttribute(node) {
      if (node.type === 'JSXSpreadAttribute') {
        return true;
      } else if (node.children) {
        return node.children.some(containsSpreadAttribute);
      } else {
        return false;
      }
    }
    function checkAvoidSpreadAttributes(node) {
      if (isBlockFunction(node)) {
        const blockFunctionBody = node.arguments[0].body;

        if (blockFunctionBody.type === 'BlockStatement') {
          const returnStatement = blockFunctionBody.body.find((stmt) => stmt.type === 'ReturnStatement');

          if (returnStatement && returnStatement.argument && containsSpreadAttribute(returnStatement.argument)) {
            context.report({
              node: returnStatement.argument,
              message:
                "You can't use spread attributes inside of a component that is wrapped with a block function, as they can introduce non-deterministic returns.",
            });
          }
        }
      }
    }

    // function checkAvoidSpreadAttributes(node) {
    //   if (isBlockFunction(node)) {
    //     // const jsxElements = [];
    //     const blockFunctionBody = node.arguments[0].body;

    //     // console.log('hey')
    //     // traverse(node.arguments[0].body, jsxElements);
    //     if (blockFunctionBody.type === "BlockStatement") {
    //       traverse(blockFunctionBody);
    //     }
    //   }
    // }

    // function traverse(currentNode) {
    //   if (currentNode && currentNode.type === "BlockStatement" &&  currentNode.openingElement) {
    //     if (hasSpreadAttribute(currentNode.openingElement.attributes)) {
    //       context.report({
    //         node: currentNode.openingElement,
    //         message:
    //           "You can't use spread attributes inside of a component that is wrapped with a block function, as they can introduce non-deterministic returns.",
    //       });
    //     }
    //     if (currentNode.children) {
    //       currentNode.children.forEach((childNode) => {
    //         traverse(childNode);
    //       });
    //     }
    //   }
    // }

    // function traverse(currentNode,jsxElements) {
    //   if (
    //     currentNode &&
    //     currentNode.type === "BlockStatement" &&
    //     currentNode.openingElement
    //   ) {
    //     console.log('heuyyy')
    //     jsxElements.push(currentNode);
    //     if (hasSpreadAttribute(currentNode.openingElement.attributes)) {
    //       context.report({
    //         node: currentNode.openingElement,
    //         message:
    //           "You can't use spread attributes inside of a component that is wrapped with a block function, as they can introduce non-deterministic returns.",
    //       });
    //     }
    //     if (currentNode.children) {
    //       currentNode.children.forEach((childNode) => {
    //         traverse(childNode);
    //       });
    //     }
    //   }
    // }

    // function traverse(currentNode, jsxElements) {
    //   console.log(currentNode, currentNode.type, "type");
    //   if (currentNode && currentNode.type === "BlockStatement") {
    //     jsxElements.push(currentNode);
    //     console.log(currentNode.openingElement, "about to");
    //     if (
    //       currentNode.openingElement.attributes &&
    //       hasSpreadAttribute(currentNode.openingElement.attributes)
    //     ) {
    //       context.report({
    //         node: currentNode.openingElement,
    //         message:
    //           "You can't use spread attributes inside of a component that is wrapped with a block function, as they can introduce non-deterministic returns.",
    //       });
    //     }
    //     if (currentNode.children) {
    //       currentNode.children.forEach((childNode) => {
    //         traverse(childNode);
    //       });
    //     }
    //   }
    // }

    return {
      CallExpression: checkAvoidSpreadAttributes,
    };
  },
};
