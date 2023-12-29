import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import * as clack from '@clack/prompts';
import {
  abort,
  abortIfCancelled,
  getNextRouter,
  highlightCodeDifferences,
} from './utils';
import type { BuildTool } from '../types';

export async function modifyConfigFile(detectedBuildTool: BuildTool) {
  try {
    const auto = await abortIfCancelled(
      clack.confirm({
        message: 'Do you want to enable automatic mode?',
        initialValue: true,
      }),
    );

    let configFileContent = await getExistingConfigContent(detectedBuildTool);
    const oldCode = configFileContent;
    const filePath = path.join(process.cwd(), detectedBuildTool.configFilePath);
    /**
     * If the config file already has million js configured, abort
     */
    configFileContent.includes('million') ||
    configFileContent.includes('million/compiler')
      ? abort(
          `${chalk.red(
            `Million.js is already configured in ${detectedBuildTool.configFilePath}.`,
          )}\n Please refer docs: https://million.dev/docs/install#use-the-compiler if facing any errors.`,
        )
      : '';

    const detectedModuleType: 'esm' | 'cjs' | 'unknown' =
      detectModuleType(configFileContent);
    /**
     * 1. Add import or require command for million to the top of the file
     * 2. Update 'export default' or 'module.exports'
     * 3. Update file with new code
     */
    if (detectedModuleType === 'cjs') {
      // 1.

      const importStatement = `const million = require('million/compiler');\n`;
      configFileContent = importStatement + configFileContent;

      // 2.
      const regex = /module\.exports\s*=\s*(?<exportContent>[^;]+)/;
      const match = regex.exec(configFileContent);

      if (match) {
        const oldExportExpression = match[1];
        const newExportExpression = await wrapExportCode(
          detectedBuildTool,
          oldExportExpression!,
          auto,
        );

        // 3.
        const newCode = configFileContent.replace(
          regex,
          `module.exports = ${newExportExpression}`,
        );

        await fs.promises.writeFile(filePath, newCode, {
          encoding: 'utf-8',
          flag: 'w',
        });

        highlightCodeDifferences(oldCode, newCode, detectedBuildTool);
      }
    } else if (detectedModuleType === 'esm') {
      // 1.
      const importStatement = `import million from 'million/compiler';\n`;

      configFileContent = importStatement + configFileContent;

      // 2.
      const regex = /export\s+default\s+(?<exportContent>[^;]+)/;
      const match = regex.exec(configFileContent);

      if (match) {
        const oldExportExpression = match[1];
        const newExportExpression = await wrapExportCode(
          detectedBuildTool,
          oldExportExpression!,
        );

        // 3.
        const newCode = configFileContent.replace(
          regex,
          `export default ${newExportExpression}`,
        );

        await fs.promises.writeFile(filePath, newCode, {
          encoding: 'utf-8',
          flag: 'w',
        });

        highlightCodeDifferences(oldCode, newCode, detectedBuildTool);
      }
    } else {
      /**
       *  If we can't detect the module type, we can't modify the config file
       *  Refer user to read installation docs
       * */

      return abort(
        `${chalk.yellow(
          `Could not detect module type for ${detectedBuildTool.configFilePath}.`,
        )}\nPlease refer docs to setup manually:${chalk.cyan(
          'https://million.dev/docs/install#use-the-compiler',
        )} `,
      );
    }

    const confirmation = await abortIfCancelled(
      clack.confirm({
        message: 'Does the config file look good?',
        initialValue: true,
      }),
    );
    if (!confirmation) {
      await fs.promises.writeFile(filePath, oldCode, {
        encoding: 'utf-8',
        flag: 'w',
      });

      return abort(
        `Reverted the changes. \nPlease refer docs for manual setup: ${chalk.cyan(
          `https://million.dev/docs/install#use-the-compiler`,
        )}`,
      );
    }
  } catch (e) {
    return abort();
  }
}

export async function getExistingConfigContent(
  detectedBuildTool: BuildTool,
): Promise<string> {
  const configFilePath = path.join(
    process.cwd(),
    detectedBuildTool.configFilePath,
  );

  // Read the config file
  const configContent = await fs.promises.readFile(configFilePath, {
    encoding: 'utf-8',
  });
  return configContent;
}

function detectModuleType(fileContent: string): 'cjs' | 'esm' | 'unknown' {
  // Check for CommonJS require/module.exports patterns
  if (fileContent.includes('module.exports =')) {
    return 'cjs';
  }

  // Check for ESM import/export statements
  if (fileContent.includes('export default')) {
    return 'esm';
  }

  return 'unknown';
}

async function wrapExportCode(
  buildtool: BuildTool,
  oldExportExpression: string,
  auto = true,
): Promise<string> {
  let [firstPart, ...rest]: string[] = [];

  switch (buildtool.name) {
    case 'next':
      /**
       * million.next(nextConfig, millionConfig);
       * */
      return handleNextCase(oldExportExpression, auto);
    case 'vite':
      /**
       * defineConfig({
       *   plugins: [million.vite({ auto: true }), react(), ],
       * });
       */
      return handleViteCase(oldExportExpression, auto)

    case 'astro':
      /**
       * defineConfig({
       *   vite: {
       *     plugins: [million.vite({ mode: 'react', server: true, auto: true }), ]
       *   }
       * });
       */
     
        return handleAstroCase(oldExportExpression, auto)
    case 'gatsby':
      /**
       * ({ actions }) => {
       *   actions.setWebpackConfig({
       *     plugins: [million.webpack({ mode: 'react', server: true, auto: true }), ],
       *   })
       * }
       */
      return handleGatsbyCase(oldExportExpression, auto)
    case 'craco':
      /**
       * {
       *   webpack: {
       *     plugins: { add: [million.webpack({ auto: true }), ] }
       *   },
       * }
       */
      return handleCracoCase(oldExportExpression, auto)
    case 'webpack':
      /**
       * {
       *   plugins: [million.webpack({ auto: true }), ],
       * }
       */
 
    return handleWebpackCase(oldExportExpression, auto)
    case 'rollup':
      /**
       * {
       *   plugins: [million.rollup({ auto: true }), ],
       * }
       */
     return handleRollupCase(oldExportExpression, auto)
    default:
      return '';
  }
}

async function handleNextCase(
  oldExportExpression: string,
  auto = true,
): Promise<string> {
  const nextRouter: 'app' | 'pages' = await getNextRouter();
  return `million.next(
  ${oldExportExpression}, { auto: ${
    auto ? (nextRouter === 'app' ? '{ rsc: true }' : 'true') : 'false'
  } }
)`;
}

function handleViteCase(
  oldExportExpression: string,
  auto = true,
) {
  const [firstPart, ...rest] = oldExportExpression.split('plugins: [');
  return `${firstPart!}plugins: [million.vite({ auto: ${String(
    auto,
  )} }), ${rest.join('plugins: [')}`
}

function handleAstroCase (
  oldExportExpression: string,
  auto = true,
) {
  const [firstPart, ...rest] = oldExportExpression.split('plugins: [');
  return `${firstPart!}plugins: [million.vite({ mode: 'react', server: true, auto: ${String(
    auto,
  )} }), ${rest.join('plugins: [')}`;
}


function handleGatsbyCase (
  oldExportExpression: string,
  auto = true,
) {
  const [firstPart, ...rest] = oldExportExpression.split('plugins: [');

  return `${firstPart!}[plugins: million.webpack({ mode: 'react', server: true, auto: ${String(
    auto,
  )} }), ${rest.join('plugins: [')}`;
}


function handleCracoCase (
  oldExportExpression: string,
  auto = true,
) {
  const [firstPart, ...rest] = oldExportExpression.split('plugins: [');
  return `${firstPart!}plugins: [million.webpack({ auto: ${String(
    auto,
  )} }), ${rest.join('plugins: [')}`;

}


function handleWebpackCase (
  oldExportExpression: string,
  auto = true,
) {
  const [firstPart, ...rest] = oldExportExpression.split('plugins: [');

  return `${firstPart!}plugins: [million.webpack({ auto: ${String(
    auto,
  )} }), ${rest.join('plugins: [')}`;
}


function handleRollupCase (
  oldExportExpression: string,
  auto = true,
) {
  const [firstPart, ...rest] = oldExportExpression.split('plugins: [');
  return `${firstPart!}plugins: [million.rollup({ auto: ${String(
    auto,
  )} }), ${rest.join('plugins: [')}`;
}


