import { builders, generateCode, parseModule } from 'magicast'
import { BuildTool } from '../types'
import * as path from 'path'
import * as fs from 'fs'
import { abort } from './clack_utils'
import chalk from 'chalk'

export async function modifyConfigFile(detectedBuildTool: BuildTool) {
  try {
    const configFileContent = await getExistingConfigContent(detectedBuildTool)

    /**
     * If the config file already has million js configured, abort
     */
    configFileContent.includes('million') || configFileContent.includes('million/compiler')
      ? await abort(
          chalk.red(`Million js already configured in ${detectedBuildTool.configFilePath}.`) +
            '\nPlease refer docs: https://million.dev/docs/install#use-the-compiler if facing any errors.',
        )
      : ''

    /**
     * 1. Add import or require command for million to the top of the file
     * 2. Update 'export default' or 'module.exports'
     * 3. Update file with new code
     */
    if (detectModuleType(configFileContent) === 'cjs') {
    } else if (detectModuleType(configFileContent) === 'esm') {
      const mod = parseModule(configFileContent)

      // 1.
      mod.imports.$add({
        from: 'million/compiler',
        imported: 'million',
      })

      // 2.
      const oldExportExpression = generateCode(mod.exports.default.$ast).code
      mod.exports.default = builders.raw(wrapExportCode(detectedBuildTool, oldExportExpression))

      // 3.
      const newGenertedCode = mod.generate().code.replace('{million}', 'million')

      await fs.promises.writeFile(path.join(process.cwd(), detectedBuildTool.configFilePath), newGenertedCode, {
        encoding: 'utf-8',
        flag: 'w',
      })
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

function detectModuleType(configContent: string): 'cjs' | 'esm' | 'unknown' {
  // Check for ESM import/export statements
  if (configContent.includes('import ') || configContent.includes('export default')) {
    return 'esm'
  }

  // Check for CommonJS require/module.exports patterns
  if (configContent.includes('require(') || configContent.includes('module.exports = ')) {
    return 'cjs'
  }

  return 'unknown'
}

function wrapExportCode(buildtool: BuildTool, oldExportExpression: string): string {
  let [firstPart, ...rest]: string[] = ['']
  let newExportExpression: string

  switch (buildtool.name) {
    case 'next':
      /**
       * million.next(nextConfig, millionConfig);
       * */
      return `million.${buildtool.bundler}(
        ${oldExportExpression}, { auto: ${buildtool.configFileContentRSC ? '{ rsc: true }' : 'true'}}
      )`
    case 'vite':
      /**
       * defineConfig({
       *   plugins: [million.vite({ auto: true }), react(), ],
       * });
       */
      ;[firstPart, ...rest] = oldExportExpression.split('[')
      newExportExpression = firstPart + `[million.vite({ auto: true }), ` + rest.join('[')
      return newExportExpression
    case 'astro':
      /**
       * defineConfig({
       *   vite: {
       *     plugins: [million.vite({ mode: 'react', server: true, auto: true }), ]
       *   }
       * });
       */
      ;[firstPart, ...rest] = oldExportExpression.split('[')
      newExportExpression = firstPart + `[million.vite({ mode: 'react', server: true, auto: true }), ` + rest.join('[')
      return newExportExpression
    case 'gatsby':
      /**
       * ({ actions }) => {
       *   actions.setWebpackConfig({
       *     plugins: [million.webpack({ mode: 'react', server: true, auto: true }), ],
       *   })
       * }
       */
      ;[firstPart, ...rest] = oldExportExpression.split('[')
      newExportExpression =
        firstPart + `[million.webpack({ mode: 'react', server: true, auto: true }), ` + rest.join('[')
      return newExportExpression
    case 'craco':
      /**
       * {
       *   webpack: {
       *     plugins: { add: [million.webpack({ auto: true }), ] }
       *   },
       * }
       */
      ;[firstPart, ...rest] = oldExportExpression.split('[')
      newExportExpression = firstPart + `[million.webpack({ auto: true }), ` + rest.join('[')
      return newExportExpression
    case 'webpack':
      /**
       * {
       *   plugins: [million.webpack({ auto: true }), ],
       * }
       */
      ;[firstPart, ...rest] = oldExportExpression.split('[')
      newExportExpression = firstPart + `[million.webpack({ auto: true }), ` + rest.join('[')
      return newExportExpression
    case 'rollup':
      /**
       * {
       *   plugins: [million.rollup({ auto: true }), ],
       * }
       */
      ;[firstPart, ...rest] = oldExportExpression.split('[')
      newExportExpression = firstPart + `[million.rollup({ auto: true }), ` + rest.join('[')
      return newExportExpression
    default:
      return ''
  }
}
