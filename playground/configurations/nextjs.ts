import { type SandpackFiles } from '@codesandbox/sandpack-react';

export const files: SandpackFiles = {
  '/next.config.js': {
    code: `import million from 'million/compiler';
 
    /** @type {import('next').NextConfig} */
    const nextConfig = {
      reactStrictMode: true,
    };
     
    export default million.next(nextConfig);`,
    readOnly: true,
  },
};
