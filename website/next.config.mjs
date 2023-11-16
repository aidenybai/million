import nextra from 'nextra';

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  staticImage: true,
});

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  transpilePackages: ['react-tweet'],
  // Add i18n configuration here
  i18n: {
    locales: ['en-US', 'zh-CN'],
    defaultLocale: 'en-US',
    localeDetection: true,
  },
  trailingSlash: true,
  async redirects() {
    return [
      {
        source: '/docs',
        destination: '/docs/index',
        permanent: true,
      },
    ]
  },
};
// eslint-disable-next-line import/no-default-export
export default withNextra(nextConfig);
