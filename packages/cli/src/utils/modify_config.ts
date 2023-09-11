import { BuildTool } from '../types'
import * as path from 'path'
import * as fs from 'fs'
import { abort, getNextRouter } from './clack_utils'
import chalk from 'chalk'

export async function modifyConfigFile(detectedBuildTool: BuildTool) {
  try {
    let configFileContent = await getExistingConfigContent(detectedBuildTool)
    const filePath = path.join(process.cwd(), detectedBuildTool.configFilePath)
    /**
     * If the config file already has million js configured, abort
     */
    configFileContent.includes('million') || configFileContent.includes('million/compiler')
      ? await abort(
          chalk.red(`Million js already configured in ${detectedBuildTool.configFilePath}.`) +
            `\n Please refer docs: https://million.dev/docs/install#use-the-compiler if facing any errors.`,
        )
      : ''

    const detectedModuleType:'esm' | 'cjs' | 'unknown' = detectModuleType(configFileContent)
    /**
     * 1. Add import or require command for million to the top of the file
     * 2. Update 'export default' or 'module.exports'
     * 3. Update file with new code
     */
    if (detectedModuleType === 'cjs') {
      // 1.
      const importStatement = `const million = require('million/compiler')\n`
      configFileContent = importStatement + configFileContent

      // 2.
      const regex = /module\.exports\s*=\s*([^;]+)/
      const match = configFileContent.match(regex)
      console.log(match)
      if (match) {
        const oldExportExpression = match[1]
        const newExportExpression = await wrapExportCode(detectedBuildTool, oldExportExpression!)

        // 3.
        const newGenertedCode = configFileContent.replace(regex, `module.exports = ${newExportExpression}`)

        await fs.promises.writeFile(filePath, newGenertedCode, {
          encoding: 'utf-8',
          flag: 'w'
        })
      }
    } else if (detectedModuleType === 'esm') {
      // 1.
      const importStatement = `import million from 'million/compiler'\n`
      configFileContent = importStatement + configFileContent

      // 2.
      const regex = /export\s+default\s+([^;]+)/
      const match = configFileContent.match(regex)

      if (match) {
        const oldExportExpression = match[1]
        const newExportExpression = await wrapExportCode(detectedBuildTool, oldExportExpression!)

        // 3.
        const newGenertedCode = configFileContent.replace(regex, `export default ${newExportExpression}`)

        await fs.promises.writeFile(filePath, newGenertedCode, {
          encoding: 'utf-8',
          flag: 'w',
        })
      }
    } else {
      /**
       *  If we can't detect the module type, we can't modify the config file
       *  Refer user to read installation docs
       * */

      abort(
        chalk.yellow(`Could not detect module type for ${detectedBuildTool.configFilePath}.`) +
          `\nPlease refer docs:` +
          chalk.cyan('https://million.dev/docs/install#use-the-compiler') +
          ` to setup manually.`,
      )
    }
  } catch (err) {
    console.log(err)
    return abort()
  }
}

export async function getExistingConfigContent(detectedBuildTool: BuildTool): Promise<string> {
  const configFilePath = path.join(process.cwd(), detectedBuildTool.configFilePath)

  // Read the config file
  const configContent = await fs.promises.readFile(configFilePath, { encoding: 'utf-8' })
  return configContent
}

function detectModuleType(fileContent: string): 'cjs' | 'esm' | 'unknown' {
  // Check for ESM import/export statements
  if (fileContent.includes('export default')) {
    return 'esm'
  }

  // Check for CommonJS require/module.exports patterns
  if (fileContent.includes('module.exports =')) {
    return 'cjs'
  }

  return 'unknown'
}

async function wrapExportCode(buildtool: BuildTool, oldExportExpression: string): Promise<string> {
  let [firstPart, ...rest]: string[] = []
  let newExportExpression: string

  switch (buildtool.name) {
    case 'next':
      /**
       * million.next(nextConfig, millionConfig);
       * */
      const nextRouter: 'app' | 'pages' = await getNextRouter()
      return newExportExpression = `million.${buildtool.bundler}(
  ${oldExportExpression}, { auto: ${nextRouter == 'app' ? '{ rsc: true }' : 'true'}}
)`
    case 'vite':
      /**
       * defineConfig({
       *   plugins: [million.vite({ auto: true }), react(), ],
       * });
       */
      ;[firstPart, ...rest] = oldExportExpression.split('plugins: [')
      return newExportExpression = firstPart + `plugins: [million.vite({ auto: true }), ` + rest.join('plugins: [')
       
    case 'astro':
      /**
       * defineConfig({
       *   vite: {
       *     plugins: [million.vite({ mode: 'react', server: true, auto: true }), ]
       *   }
       * });
       */
      ;[firstPart, ...rest] = oldExportExpression.split('plugins: [')
      return newExportExpression = firstPart + `plugins: [million.vite({ mode: 'react', server: true, auto: true }), ` + rest.join('plugins: [')
      
    case 'gatsby':
      /**
       * ({ actions }) => {
       *   actions.setWebpackConfig({
       *     plugins: [million.webpack({ mode: 'react', server: true, auto: true }), ],
       *   })
       * }
       */
      ;[firstPart, ...rest] = oldExportExpression.split('plugins: [')
      return newExportExpression =
        firstPart + `[plugins: million.webpack({ mode: 'react', server: true, auto: true }), ` + rest.join('plugins: [')
    case 'craco':
      /**
       * {
       *   webpack: {
       *     plugins: { add: [million.webpack({ auto: true }), ] }
       *   },
       * }
       */
      ;[firstPart, ...rest] = oldExportExpression.split('plugins: [')
      return newExportExpression = firstPart + `plugins: [million.webpack({ auto: true }), ` + rest.join('plugins: [')
      
    case 'webpack':
      /**
       * {
       *   plugins: [million.webpack({ auto: true }), ],
       * }
       */
      ;[firstPart, ...rest] = oldExportExpression.split('plugins: [')
      return newExportExpression = firstPart + `plugins: [million.webpack({ auto: true }), ` + rest.join('plugins: [')

    case 'rollup':
      /**
       * {
       *   plugins: [million.rollup({ auto: true }), ],
       * }
       */
      ;[firstPart, ...rest] = oldExportExpression.split('plugins: [')
      return newExportExpression = firstPart + `plugins: [million.rollup({ auto: true }), ` + rest.join('plugins: [')
    default:
      return ''
  }
}