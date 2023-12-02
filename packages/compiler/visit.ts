import * as t from '@babel/types';
import { addNamed } from '@babel/helper-module-imports';
import { resolveImportSource } from './utils/mod';
import { transformFor } from './for';
import { catchError } from './utils/log';
import type { Options } from './options';
import type { NodePath, PluginObj } from '@babel/core';

type Nullable<T> = { [K in keyof T]: T[K] | null };
export interface Info {
  block: {
    name: string;
    source: string;
  } | null;
  For: {
    name: string;
    source: string;
  } | null;
  aliases: {
    block: Set<string>;
    For: Set<string>;
  };
  programPath: NodePath<t.Program>;
  // TODO: add debug that stores timings
}

export const visit = (
  options: Options,
  filename: string
): PluginObj['visitor'] => {
  const state: Nullable<Info> = {
    block: null,
    For: null,
    aliases: {
      block: new Set(),
      For: new Set(),
    },
    programPath: null,
  };
  let info: Info | null = null;

  return {
    Program(programPath: NodePath<t.Program>) {
      programPath.traverse<Nullable<Info>>(
        {
          ImportDeclaration(path, state) {
            if (state.block && state.For) {
              path.stop();
              return;
            }
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
              if (!t.isImportSpecifier(specifier)) continue;

              if (
                t.isIdentifier(specifier.imported) &&
                specifier.imported.name === 'block'
              ) {
                if (!source) continue;
                if (!state.block) {
                  state.block = {
                    name: specifier.local.name,
                    source,
                  };
                }
                state.aliases!.block.add(specifier.local.name);
                importSource.value = source;
                continue;
              }

              if (
                t.isIdentifier(specifier.imported) &&
                specifier.imported.name === 'For'
              ) {
                if (!source) continue;
                if (!state.For) {
                  state.For = {
                    name: specifier.local.name,
                    source,
                  };
                }
                state.aliases!.For.add(specifier.local.name);
                importSource.value = source;
                continue;
              }
            }
          },
        },
        state
      );
      if (!state.block && !state.For) return;

      if (!state.block && state.For?.source) {
        state.block = {
          name: addNamed(programPath, 'block', state.For.source).name,
          source: state.For.source,
        };
      }

      // TODO: double check if ! assertions are needed
      info = {
        block: state.block!,
        For: state.For,
        aliases: state.aliases!,
        programPath,
      };
    },
    // JSXElement(path) {
    //   catchError(() => {
    //     transformFor(options, path, filename, info!);
    //   }, options.log);
    // },
    // CallExpression(path) {
    //   handleVisitorError(() => {
    //     callExpressionVisitor(path, blockCache, dirname);
    //   }, options.mute);
    // },
    // FunctionDeclaration(path) {
    //   handleVisitorError(() => {
    //     if (!componentVisitor) return;
    //     componentVisitor(path, dirname);
    //   }, options.mute);
    // },
    // VariableDeclarator(path) {
    //   handleVisitorError(() => {
    //     if (!componentVisitor) return;
    //     componentVisitor(path, dirname);
    //   }, options.mute);
    // },
  };
};
