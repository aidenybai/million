import * as fs from 'fs'
import * as path from 'path'
import * as clack from '@clack/prompts'
import { BuildTool } from '../types'
import { abortIfCancelled } from './clack_utils'

const next: BuildTool = {
  name: 'next',
  label: 'Next.js',
  configFilePath: 'next.config.mjs' || 'next.config.js',
  configFileContent: `
  import million from 'million/compiler';
 
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    reactStrictMode: true,
  };
   
  const millionConfig = {
    auto: true,
  }
   
  export default million.next(nextConfig, millionConfig);`,
  configFileContentRSC: `
  import million from 'million/compiler';

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
  configFileContent: `
  import { defineConfig } from 'astro/config';
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
  configFileContent: `
  const million = require('million/compiler');
 
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
  configFileContent: `
  import million from 'million/compiler';
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
  configFileContent: `
  const million = require('million/compiler');
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
  configFileContent: `
  const million = require('million/compiler');
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
  configFileContent: `
  import million from 'million/compiler';
 
  export default {
    plugins: [million.rollup({ auto: true })],
  };`,
}

const buildTools: BuildTool[] = [next, astro, gatsby, vite, craco, webpack, rollup]

export function detectBuildTool(): BuildTool | null {
  for (const buildTool of buildTools) {
    if (fs.existsSync(path.join(process.cwd(), buildTool.configFilePath))) {
      return buildTool
    }
  }
  // No build tool detected using config files
  return null
}

export async function getBuildTool(): Promise<BuildTool> {
  const selectedBuildTool: BuildTool | symbol = await abortIfCancelled(
    clack.select({
      message: 'Please select your build tool.',
      options: buildTools.map((buildTool) => ({
        value: buildTool,
        label: buildTool.label,
      })),
    }),
  )

  return selectedBuildTool
}

export async function createConfigFile(): Promise<void> {
  const detectedBuildTool = detectBuildTool()

  let buildTool: BuildTool | undefined = undefined

  if (detectedBuildTool) {
    clack.log.info(`Found existing ${detectedBuildTool.configFilePath} file. Skipping creation...`)
    return
  } else {
    buildTool = await getBuildTool()
  }

  const targetFilePath = path.join(process.cwd(), buildTool.configFilePath)
  if (buildTool.name === 'next') {
    if (fs.existsSync('src/app' || 'app')) {
      await fs.promises.writeFile(targetFilePath, next.configFileContentRSC!)
      return
    } else if (fs.existsSync('src/pages' || 'pages')) {
      await fs.promises.writeFile(targetFilePath, next.configFileContent)
      return
    } else {
      // both pages and app router not found. ask user to select one
      const selectedRouter = await abortIfCancelled(
        clack.select({
          message: 'Will you use app Router or pages Router?',
          options: [
            {
              label: 'App Router',
              value: 'app',
            },
            {
              label: 'Pages Router',
              value: 'pages',
            },
          ],
        }),
      )
      if (selectedRouter === 'app') {
        await fs.promises.writeFile(targetFilePath, next.configFileContentRSC!)
        return
      } else {
        await fs.promises.writeFile(targetFilePath, next.configFileContent)
        return
      }
    }
  }

  clack.log.info(`Creating ${buildTool.configFilePath} file...`)

  await fs.promises.writeFile(buildTool.configFilePath, buildTool.configFileContent)
}
