// eslint-disable-next-line import/default -- Next.js requires default export
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
  i18n: {
    locales: ['en-US', 'zh-CN', 'es-ES', 'fr-FR'],
    defaultLocale: 'en-US',
  },
  async redirects() {
    return [
      {
        source: '/docs.([a-zA-Z-]+)',
        destination: '/docs/introduction',
        statusCode: 302,
      },
      {
        source: '/chat',
        destination: 'https://discord.gg/QezWCDeYfH',
        statusCode: 302,
      },
    ];
  },
};

// eslint-disable-next-line import/no-default-export  -- Next.js requires default export
export default withNextra(nextConfig);
