const { resolve } = require('path');

const project = resolve(__dirname, 'tsconfig.json');

module.exports = {
  root: true,
  extends: [
    require.resolve('@vercel/style-guide/eslint/node'),
    require.resolve('@vercel/style-guide/eslint/typescript'),
  ],
  parserOptions: {
    project,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-shadow': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-loop-func': 'off',
        'eslint-comments/disable-enable-pair': 'off',
        'import/no-cycle': 'off',
        'import/no-default-export': 'off',
        'no-nested-ternary': 'off',
        'no-param-reassign': 'off',
        'tsdoc/syntax': 'off',
        'import/no-extraneous-dependencies': 'off',
        'eslint-comments/require-description': 'off',
        'import/no-relative-packages': 'off',
      },
    },
  ],
};
