import * as t from '@babel/types';
import type { Options } from '../plugin';
import type { NodePath } from '@babel/core';

export const getNamedImports = (
  path: NodePath<t.Program>,
  filter = 'million',
): {
  namedImports: Record<string, string>;
  localImports: Record<string, string>;
} => {
  const namedImports: Record<string, string> = {};
  const localImports: Record<string, string> = {};

  const programBodyPath = path.get('body');

  for (let i = 0, j = programBodyPath.length; i < j; ++i) {
    const importDeclarationPath = programBodyPath[i];

    if (!importDeclarationPath?.isImportDeclaration()) {
      continue;
    }

    const importDeclaration = importDeclarationPath.node;

    if (filter && importDeclaration.source.value.includes(filter)) {
      continue;
    }

    const specifiers = importDeclaration.specifiers;

    for (let k = 0, l = specifiers.length; k < l; ++k) {
      const specifier = specifiers[k];

      if (
        !t.isImportSpecifier(specifier) ||
        !t.isIdentifier(specifier.imported)
      ) {
        continue;
      }

      // imported = name of the actual export `import { export } from 'mod'`
      // local = name of the local alias `import { export as local } from 'mod'

      namedImports[specifier.imported.name] = specifier.local.name;
      localImports[specifier.local.name] = specifier.imported.name;
    }
  }

  return { namedImports, localImports };
};

export const resolveImportSource = (options: Options, source: string) => {
  if (!source.startsWith('million')) return source;
  const mode = options.mode || 'react';
  if (options.server) {
    return `million/${mode}-server`;
  }
  return `million/${mode}`;
};

export const getImportDeclaration = (
  programPath: NodePath<t.Program>,
  name: string,
) => {
  if (!programPath.scope.hasBinding(name)) {
    throw createDeopt(
      'Unable to find AST binding for For. Check that the For component is imported correctly.',
      file,
      programPath,
    );
  }

  const binding = programPath.scope.getBinding(name);
  const importDeclarationPath = path.findParent((path) =>
    path.isImportDeclaration(),
  ) as NodePath<t.ImportDeclaration>;
  const importDeclaration = importDeclarationPath.node;

  return importDeclarationPath;
};
