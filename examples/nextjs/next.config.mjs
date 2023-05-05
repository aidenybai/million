import million from 'million/compiler';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
};

export default million.next(nextConfig);
