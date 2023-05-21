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
  async redirects() {
    return [
      {
        source: '/docs',
        destination: '/docs/quickstart',
        permanent: false,
      },
    ];
  },
};

// eslint-disable-next-line import/no-default-export
export default withNextra(nextConfig);
