import type { BuildTool, PackageManager } from '../types';

/**
 * Package managers
 */

export const yarn: PackageManager = {
  name: 'yarn',
  label: 'Yarn',
  lockFile: 'yarn.lock',
  installCommand: 'yarn add',
};

export const pnpm: PackageManager = {
  name: 'pnpm',
  label: 'pnpm',
  lockFile: 'pnpm-lock.yaml',
  installCommand: 'pnpm install',
};

export const npm: PackageManager = {
  name: 'npm',
  label: 'npm',
  lockFile: 'package-lock.json',
  installCommand: 'npm install',
};

export const bun: PackageManager = {
  name: 'bun',
  label: 'bun',
  lockFile: 'bun.lockb',
  installCommand: 'bun add',
};
export const packageManagers = [pnpm, yarn, bun, npm];

/**
 * Build tools
 */
const next: BuildTool = {
  name: 'next',
  label: 'Next.js',
  bundler: 'next',
  configFilePath: 'next.config.mjs',
  possibleFileNames: ['next.config.js', 'next.config.mjs'],
  configFileContent: `import million from 'million/compiler';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

const millionConfig = {
  auto: true,
};

export default million.next(nextConfig, millionConfig);`,
  configFileContentRSC: `import million from 'million/compiler';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

const millionConfig = {
  auto: { rsc: true },
};

export default million.next(nextConfig, millionConfig);
`,
};
const astro: BuildTool = {
  name: 'astro',
  label: 'Astro',
  bundler: 'vite',
  configFilePath: 'astro.config.mjs',
  possibleFileNames: ['astro.config.js', 'astro.config.mjs', 'astro.config.ts'],
  configFileContent: `import { defineConfig } from 'astro/config';
import million from 'million/compiler';

export default defineConfig({
  vite: {
    plugins: [million.vite({ mode: 'react', server: true, auto: true })]
  }
});`,
};
const gatsby: BuildTool = {
  name: 'gatsby',
  label: 'Gatsby',
  bundler: 'webpack',
  configFilePath: 'gatsby-node.js',
  possibleFileNames: ['gatsby-node.js'],
  configFileContent: `const million = require('million/compiler');

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    plugins: [million.webpack({ mode: 'react', server: true, auto: true })],
  })
};`,
};
const vite: BuildTool = {
  name: 'vite',
  label: 'Vite',
  bundler: 'vite',
  configFilePath: 'vite.config.js',
  possibleFileNames: [
    'vite.config.js',
    'vite.config.mjs',
    'vite.config.ts',
    'vite.config.cjs',
  ],
  configFileContent: `import million from 'million/compiler';
import react from "@vitejs/plugin-react";
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [million.vite({ auto: true }), react()],
});`,
};
const craco: BuildTool = {
  name: 'craco',
  label: 'Create React App',
  bundler: 'webpack',
  configFilePath: 'craco.config.js',
  possibleFileNames: [
    'craco.config.js',
    'craco.config.mjs',
    'craco.config.ts',
    'craco.config.cjs',
  ],
  configFileContent: `const million = require('million/compiler');
module.exports = {
  webpack: {
    plugins: { add: [million.webpack({ auto: true })] }
  }
};`,
};
const webpack: BuildTool = {
  name: 'webpack',
  label: 'Webpack',
  bundler: 'webpack',
  configFilePath: 'webpack.config.js',
  possibleFileNames: ['webpack.config.js'],
  configFileContent: `const million = require('million/compiler');
module.exports = {
  plugins: [
    million.webpack({ auto: true }),
  ],
};`,
};
const rollup: BuildTool = {
  name: 'rollup',
  label: 'Rollup',
  bundler: 'rollup',
  configFilePath: 'rollup.config.js',
  possibleFileNames: [
    'rollup.config.js',
    'rollup.config.mjs',
    'rollup.config.ts',
    'rollup.config.cjs',
  ],
  configFileContent: `import million from 'million/compiler';

export default {
  plugins: [million.rollup({ auto: true })],
};`,
};
const packit: BuildTool = {
  name: 'packit',
  label: 'Reejs (Packit)',
  bundler: 'reejs packit',
  configFilePath: 'packit.config.js',
  possibleFileNames: [
    'packit.config.js',
    'reecfg.json'
  ],
  configFileContent: `import million from 'million/compiler';

export default {
  plugins: [million.packit({ auto: true })],
};`,
};

export const buildTools: BuildTool[] = [
  next,
  astro,
  gatsby,
  vite,
  craco,
  webpack,
  rollup,
  packit,
];
