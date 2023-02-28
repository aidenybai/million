const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.js',
  unstable_flexsearch: {
    codeblocks: true,
  },
});
module.exports = {
  ...withNextra(),
  eslint: {
    ignoreDuringBuilds: true,
  },
};
