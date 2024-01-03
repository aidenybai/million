import * as t from '@babel/types';
import { addNamed } from '@babel/helper-module-imports';
import type { NodePath, PluginObj } from '@babel/core';
import { resolveImportSource } from './utils/mod';
import { transformFor } from './for';
import { catchError } from './utils/log';
import type { Options } from './options';
import { transformBlock } from './block';
import { parseAuto } from './auto';

export interface Info {
  imports: {
    block: string | null;
    For: string | null;
    renderReactScope: string | null;
    aliases: {
      block: Set<string> | null;
      For: Set<string> | null;
      renderReactScope: Set<string> | null;
    };
    source: string | null;
  };
  programPath: NodePath<t.Program>;
  blocks: Map<string, t.Identifier>;
  filename: string;
  options: Options;
  // TODO: add debug that stores timings
}

export function babel(
  _: unknown,
  options: Options,
  filename: string
): PluginObj {
  const state: Info['imports'] = {
    block: null,
    For: null,
    renderReactScope: null,
    aliases: {
      block: null,
      For: null,
      renderReactScope: null,
    },
    source: null,
  };
  let info: Info | null = null;

  return {
    name: 'million',
    visitor: {
      Program: {
        enter(programPath: NodePath<t.Program>) {
          info = {
            imports: state,
            programPath,
            blocks: new Map<string, t.Identifier>(),
            filename,
            options,
          };

          programPath.traverse<Info['imports']>(
            {
              ImportDeclaration(path, state) {
                const importDeclaration = path.node;
                const importSource = importDeclaration.source;
                if (!importSource.value.includes('million')) return;

                /**
                 * There are different imports based on the library (e.g. million/react, million/preact, etc.)
                 * and usage context (e.g. million/react-server, million/preact-server, etc.). Based on user
                 * provided options, we resolve the correct import source.
                 */
                const source = resolveImportSource(options, importSource.value);

                for (
                  let i = 0, j = importDeclaration.specifiers.length;
                  i < j;
                  ++i
                ) {
                  const specifier = importDeclaration.specifiers[i];
                  if (
                    !t.isImportSpecifier(specifier) ||
                    !t.isIdentifier(specifier.imported) ||
                    !source
                  )
                    continue;

                  const name = specifier.imported.name;

                  switch (name) {
                    case 'block':
                    case 'For':
                    case 'renderReactScope':
                      if (!state[name]) {
                        state[name] = specifier.local.name;
                      }
                      if (!state.aliases[name]) {
                        state.aliases[name] = new Set();
                      }
                      state.aliases[name]?.add(specifier.local.name);
                      importSource.value = source;
                      if (!state.source) state.source = source;
                      break;
                  }
                }
              },
            },
            state
          );
          if (!state.source) return;

          if (!state.block) {
            state.block = addNamed(programPath, 'block', state.source).name;
          }

          // TODO: double check if ! assertions are needed
          info.imports = {
            block: state.block,
            For: state.For!,
            renderReactScope: state.renderReactScope!,
            aliases: {
              block: state.aliases.block!,
              For: state.aliases.For!,
              renderReactScope: state.aliases.renderReactScope!,
            },
            source: state.source,
          };
        },
        exit(programPath: NodePath<t.Program>) {
          if (!info?.imports.source) {
            return;
          }
          // https://github.com/babel/babel/issues/11573
          const programBody = programPath.get('body');
          if (!programBody.length) return;
          for (let i = 0, j = programBody.length; i < j; ++i) {
            const path = programBody[i];
            if (!path?.isImportDeclaration()) continue;
            (path.node as any)._blockHoist = 3;
          }
        },
      },
      JSXElement(path) {
        catchError(() => {
          transformFor(path, info!);
        }, options.log);
      },
      CallExpression(path) {
        catchError(() => {
          transformBlock(path, info!);
        }, options.log);
      },
      FunctionDeclaration(path) {
        catchError(() => {
          parseAuto(path, info!);
        }, options.log);
      },
      VariableDeclarator(path) {
        catchError(() => {
          parseAuto(path, info!);
        }, options.log);
      },
    },
  };
}
