module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Found unsupported import for block. Make sure blocks are imported from million/react.',
      category: 'Best Practices',
      fixable: 'code',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const { type, specifiers, source } = node;
        if (
          type === 'ImportDeclaration' &&
          specifiers[0].type === 'ImportSpecifier' &&
          specifiers[0].imported.name === 'block' &&
          source.value !== 'million/react'
        ) {
          context.report({
            node: type,
            message:
              '[Million.js] Found unsupported import for block. Make sure blocks are imported from million/react.',
          });
        }
      },
    };
  },
};
