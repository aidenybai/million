import * as t from '@babel/types';
import { addNamed } from '@babel/helper-module-imports';
import { resolveImportSource } from './adderall/utils/mod';
import type { Options } from './plugin';
import type { PluginObj, NodePath } from '@babel/core';

type Nullable<T> = { [K in keyof T]: T[K] | null };
export interface Info {
  block: string;
  For: string | null;
  source: string;
  programPath: NodePath<t.Program>;
  // TODO: add debug that stores timings
}

export const Compiler = (options: Options, dirname: string): PluginObj => {
  const state: Nullable<Info> = {
    block: null,
    For: null,
    source: null,
    programPath: null,
  };
  let info: Info | null = null;

  return {
    name: 'million',
    visitor: {
      Program(programPath) {
        programPath.traverse<Nullable<Info>>(
          {
            ImportDeclaration(path, state) {
              if (state.block && state.For) return path.stop();
              const importDeclaration = path.node;
              const importSource = importDeclaration.source;
              if (!importSource.value.includes('million')) return;

              /**
               * There are different imports based on the library (e.g. million/react, million/preact, etc.)
               * and usage context (e.g. million/react-server, million/preact-server, etc.). Based on user
               * provided options, we resolve the correct import source.
               */
              const source = resolveImportSource(options, importSource.value);
              importSource.value = source;

              // by default, we use the first import source
              if (source.startsWith('million')) {
                state.source = source;
              }

              for (
                let i = 0, j = importDeclaration.specifiers.length;
                i < j;
                ++i
              ) {
                const specifier = importDeclaration.specifiers[i];
                if (!t.isImportSpecifier(specifier)) continue;

                if (
                  t.isIdentifier(specifier.imported) &&
                  specifier.imported.name === 'block'
                ) {
                  if (!state.block) {
                    state.source = source;
                    state.block = specifier.local.name;
                  }
                  continue;
                }

                if (
                  t.isIdentifier(specifier.imported) &&
                  specifier.imported.name === 'For'
                ) {
                  if (!state.For) {
                    state.source = source;
                    state.For = specifier.local.name;
                  }
                  continue;
                }
              }
            },
          },
          state,
        );
        if (!state.block && !state.For) return;

        if (!state.block && state.source) {
          state.block = addNamed(programPath, 'block', state.source).name;
        }

        // TODO: double check if ! assertions are needed
        info = {
          block: state.block!,
          For: state.For,
          source: state.source!,
          programPath,
        };
      },
      JSXElement(path) {
        vis.JSXElement(path, dirname);
      },
      CallExpression(path) {
        handleVisitorError(() => {
          callExpressionVisitor(path, blockCache, dirname);
        }, options.mute);
      },
      FunctionDeclaration(path) {
        handleVisitorError(() => {
          if (!componentVisitor) return;
          componentVisitor(path, dirname);
        }, options.mute);
      },
      VariableDeclarator(path) {
        handleVisitorError(() => {
          if (!componentVisitor) return;
          componentVisitor(path, dirname);
        }, options.mute);
      },
    },
  };
};
