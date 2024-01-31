import type { PluginObj, PluginPass } from '@babel/core';
import { transformAuto } from './auto.new';
import { transformBlock } from './block.new';
import { IMPORTS } from './constants.new';
import type { CompilerOptions, StateContext } from "./types";
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
        auto: this.opts.auto ?? false,
        hmr: this.opts.hmr ?? false,
        server: this.opts.server ?? false,
        definitions: {
          identifiers: new Map(),
          namespaces: new Map(),
        },
        imports: new Map(),
      };
    },
    visitor: {
      Program(programPath, ctx) {
        if (ctx.state.auto) {
          transformAuto(ctx.state, programPath);
        }
        programPath.traverse({
          ImportDeclaration(path) {
            const mod = path.node.source.value;
            for (const importName in IMPORTS) {
              const definition = IMPORTS[importName][ctx.state.server ? 'server' : 'client'];
              if (definition.source === mod) {
                registerImportDefinition(ctx.state, path, definition);
              }
            }
          }
        });
      },
      CallExpression(path, ctx) {
        transformBlock(ctx.state, path);
      },
    },
  };
}