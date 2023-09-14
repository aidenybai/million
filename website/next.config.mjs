import million from 'million/compiler'
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
};

// eslint-disable-next-line import/no-default-export
export default million.next(
  withNextra(nextConfig), { auto: true}
);
