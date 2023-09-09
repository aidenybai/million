import * as fs from 'fs'
import * as path from 'path'
import * as clack from '@clack/prompts'
import { BuildTool } from '../types'
import { abortIfCancelled, getNextRouter } from './clack_utils'
import chalk from 'chalk'
import { buildTools } from './constants'

export function detectBuildTool(): BuildTool | null {
  for (const buildTool of buildTools) {
    if (fs.existsSync(path.join(process.cwd(), buildTool.configFilePath))) {
      return buildTool
    } else if (
      buildTool.name == 'next' &&
      fs.existsSync(path.join(process.cwd(), buildTool.configFilePath.replace('.mjs', '.js')))
    ) {
      let xbuildTool = { ...buildTool, configFilePath: buildTool.configFilePath.replace('.mjs', '.js') }
      return xbuildTool
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

  if (detectedBuildTool) {
    clack.note(`Found existing ${detectedBuildTool.configFilePath} file...`, `Skip creating config file`)
    return
  }

  let buildTool: BuildTool = await getBuildTool()

  const targetFilePath = path.join(process.cwd(), buildTool.configFilePath)

  if (buildTool.name === 'next') {
    // check next router for rsc configuration (App router uses React Server Components)
    let nextRouter: 'app' | 'pages' | undefined = getNextRouter()

    if (nextRouter === undefined) {
      const selectedRouter: 'app' | 'pages' = await abortIfCancelled(
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
      nextRouter = selectedRouter
    }

    clack.note(`at ${chalk.green(targetFilePath)}`, `Created ${chalk.green(buildTool.configFilePath)} file`)

    nextRouter === 'app'
      ? await fs.promises.writeFile(targetFilePath, buildTool.configFileContentRSC!)
      : await fs.promises.writeFile(targetFilePath, buildTool.configFileContent)

    return
  } else {
    clack.note(`at ${chalk.green(targetFilePath)}`, `Created ${chalk.green(buildTool.configFilePath)} file`)
    await fs.promises.writeFile(targetFilePath, buildTool.configFileContent)
    return
  }
}
