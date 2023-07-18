module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Components will cause degraded performance. Ideally, you should use DOM elements instead.',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      JSXElement(node) {
        context.report({
          node,
          message:
            '[Million.js] Components will cause degraded performance. Ideally, you should use DOM elements instead.',
        });
      },
    };
  },
};
