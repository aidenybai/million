module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Found unsupported argument for block. Make sure blocks consume a reference to a component function or the direct declaration',
      category: 'Best Practices',
      fixable: 'code',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const { callee, arguments: args } = node;

        const { type, name } = callee;
        if (
          type === 'Identifier' &&
          name === 'block' &&
          args[0].type === 'JSXElement'
        ) {
          context.report({
            node: node,
            message:
              '[Million.js] Found unsupported argument for block. Make sure blocks consume a reference to a component function or the direct declaration',
          });
        }
      },
    };
  },
};
