module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Block needs to be defined as a variable declaration.',
      category: 'Best Practices',
      fixable: 'code',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const { type, name } = node.callee;
        const parent = node.parent;

        if (
          type === 'Identifier' &&
          name === 'block' &&
          (!parent || parent.type !== 'VariableDeclarator')
        ) {
          context.report({
            node: node.callee, // Updated to "node.callee" instead of "callee"
            message:
              '[Million.js] Block needs to be defined as a variable declaration.',
          });
        }
      },
    };
  },
};
