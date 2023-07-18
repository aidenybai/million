module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Conditional expressions will degrade performance. We recommend using deterministic returns instead.",
      category: "Best Practices",
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      ConditionalExpression(node) {
        context.report({
            node,
            message: '[Million.js] Conditional expressions will degrade performance. We recommend using deterministic returns instead.',
        });
      },
    };
  }
};

