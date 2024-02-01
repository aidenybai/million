import type { PluginObj, PluginPass } from '@babel/core';
import { transformAuto } from './auto.new';
import { transformBlock } from './block.new';
import { TRACKED_IMPORTS, TrackedImports } from './constants.new';
import type { CompilerOptions, StateContext } from './types';
import { isUseClient } from './utils/mod';
import { registerImportDefinition } from './utils/register-import-definition';

interface PluginState extends PluginPass {
  state: StateContext;
  opts: CompilerOptions;
}

export function babel(): PluginObj<PluginState> {
  return {
    name: 'million',
    pre(): void {
      this.state = {
        options: this.opts,
        definitions: {
          identifiers: new Map(),
          namespaces: new Map(),
        },
        imports: new Map(),
        topLevelRSC: false,
      };
    },
    visitor: {
      Program(programPath, ctx) {
        if (ctx.state.options.rsc) {
          ctx.state.topLevelRSC = isUseClient(programPath.node.directives);
        }
        if (ctx.state.options.auto) {
          transformAuto(ctx.state, programPath);
        }
        programPath.traverse({
          ImportDeclaration(path) {
            const mod = path.node.source.value;
            for (const importName in TRACKED_IMPORTS) {
              const serverDefinition =
                TRACKED_IMPORTS[importName as keyof TrackedImports].server;
              if (serverDefinition.source === mod) {
                registerImportDefinition(ctx.state, path, serverDefinition);
              }
              const clientDefinition =
                TRACKED_IMPORTS[importName as keyof TrackedImports].client;
              if (clientDefinition.source === mod) {
                registerImportDefinition(ctx.state, path, clientDefinition);
              }
            }
          },
        });
      },
      CallExpression(path, ctx) {
        transformBlock(ctx.state, path);
      },
    },
  };
}
