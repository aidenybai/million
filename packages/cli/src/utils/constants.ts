import { BuildTool, PackageManager } from '../types'

/**
 * Package managers
 */

const yarn: PackageManager = {
  name: 'yarn',
  label: 'Yarn',
  lockFile: 'yarn.lock',
  installCommand: 'yarn add',
}
const pnpm: PackageManager = {
  name: 'pnpm',
  label: 'PNPM',
  lockFile: 'pnpm-lock.yaml',
  installCommand: 'pnpm install',
}
const npm: PackageManager = {
  name: 'npm',
  label: 'NPM',
  lockFile: 'package-lock.json',
  installCommand: 'npm install',
}

export const packageManagers = [yarn, pnpm, npm]

/**
 * Build tools
 */
const next: BuildTool = {
  name: 'next',
  label: 'Next.js',
  configFilePath: 'next.config.mjs',
  configFileContent: `import million from 'million/compiler';
  
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
  };
    
  const millionConfig = {
    auto: true,
  }
    
  export default million.next(nextConfig, millionConfig);`,
  configFileContentRSC: `import million from 'million/compiler';
  
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
  };
  
  const millionConfig = {
    auto: { rsc: true },
  }
  
  export default million.next(nextConfig, millionConfig);
  `,
}
const astro: BuildTool = {
  name: 'astro',
  label: 'Astro',
  configFilePath: 'astro.config.mjs',
  configFileContent: `import { defineConfig } from 'astro/config';
  import million from 'million/compiler';
  
  export default defineConfig({
    vite: {
      plugins: [million.vite({ mode: 'react', server: true, auto: true })]
    }
  });`,
}
const gatsby: BuildTool = {
  name: 'gatsby',
  label: 'Gatsby',
  configFilePath: 'gatsby-node.js',
  configFileContent: `const million = require('million/compiler');
   
  exports.onCreateWebpackConfig = ({ actions }) => {
    actions.setWebpackConfig({
      plugins: [million.webpack({ mode: 'react', server: true, auto: true })],
    })
  }`,
}
const vite: BuildTool = {
  name: 'vite',
  label: 'Vite',
  configFilePath: 'vite.config.js',
  configFileContent: `import million from 'million/compiler';
  import react from "@vitejs/plugin-react";
  import { defineConfig } from 'vite';
  
  export default defineConfig({
    plugins: [million.vite({ auto: true }), react()],
  });`,
}
const craco: BuildTool = {
  name: 'craco',
  label: 'Create React App',
  configFilePath: 'craco.config.js',
  configFileContent: `const million = require('million/compiler');
  module.exports = {
    webpack: {
      plugins: { add: [million.webpack({ auto: true })] }
    }
  };`,
}
const webpack: BuildTool = {
  name: 'webpack',
  label: 'Webpack',
  configFilePath: 'webpack.config.js',
  configFileContent: `const million = require('million/compiler');
  module.exports = {
    plugins: [
      million.webpack({ auto: true }),
    ],
  }`,
}
const rollup: BuildTool = {
  name: 'rollup',
  label: 'Rollup',
  configFilePath: 'rollup.config.js',
  configFileContent: `import million from 'million/compiler';
  
  export default {
    plugins: [million.rollup({ auto: true })],
  };`,
}

export const buildTools: BuildTool[] = [next, astro, gatsby, vite, craco, webpack, rollup]
