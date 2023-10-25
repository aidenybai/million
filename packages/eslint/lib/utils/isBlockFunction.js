
function isBlockFunction(node) {
  return (
    node.type === "CallExpression" &&
    node.callee.name === "block" &&
    node.arguments.length === 1 &&
    (node.arguments[0].type === "ArrowFunctionExpression" ||
      (node.arguments[0].type === "JSXElement" &&
        node.arguments[0].openingElement.name.type === "JSXIdentifier"))
  );
}
module.exports = isBlockFunction;
