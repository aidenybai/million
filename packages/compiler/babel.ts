import type { PluginObj, PluginPass } from '@babel/core';
import { transformAuto } from './auto';
import { transformBlock } from './block';
import type { TrackedImports } from './constants';
import { INVERSE_IMPORTS, TRACKED_IMPORTS } from './constants';
import type { CompilerOptions, StateContext } from './types';
import { isUseClient } from './utils/is-use-client';
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
        serverMode: this.opts.server ? 'server' : 'client',
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
            if (
              INVERSE_IMPORTS[ctx.state.serverMode].source ===
              path.node.source.value
            ) {
              path.node.source.value =
                INVERSE_IMPORTS[ctx.state.serverMode].target;
            }
            const mod = path.node.source.value;
            for (const importName in TRACKED_IMPORTS) {
              const definition =
                TRACKED_IMPORTS[importName as keyof TrackedImports][
                  ctx.state.serverMode
                ];
              if (definition.source === mod) {
                registerImportDefinition(ctx.state, path, definition);
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
