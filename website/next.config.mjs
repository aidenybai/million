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
<<<<<<< HEAD
    locales: ['en-US', 'zh-CN', 'de-DE'],
    defaultLocale: 'en-US',
  },
=======
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
    ];
  },
>>>>>>> 36d1913569efff3399cde30dbda145ffd761115e
};

// eslint-disable-next-line import/no-default-export  -- Next.js requires default export
export default withNextra(nextConfig);
