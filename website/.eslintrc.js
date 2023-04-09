const { resolve } = require('path');

const project = resolve(__dirname, 'tsconfig.json');

module.exports = {
  root: true,
  extends: ['../.eslintrc.js'],
  parserOptions: {
    project,
  },
};
