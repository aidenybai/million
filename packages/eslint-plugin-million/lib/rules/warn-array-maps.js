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
  create(context) {
    return {
      CallExpression(node) {
        const { type, property, object } = node.callee;
        if (
          type === 'MemberExpression' &&
          property.name === 'map' &&
          object.type === 'Identifier'
      ){
          context.report({
          node: node,
          message:
              '[Million.js] Array.map() will degrade performance. We recommend removing the block on the current component and using a <For /> component instead.',
          });
        }
      },
    };
  }
};

