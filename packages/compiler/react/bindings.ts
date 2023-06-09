import * as t from '@babel/types';
import type { NodePath } from '@babel/core';

export function collectImportedBindings(
  path: NodePath<t.Program>,
  moduleName: string,
): Record<string, string> {
  const importedBindings: Record<string, string> = {};

  const importDeclarations = path
    .get('body')
    .filter((node) => t.isImportDeclaration(node.node));

  for (const importDeclaration of importDeclarations) {
    if (
      t.isImportDeclaration(importDeclaration.node) &&
      importDeclaration.node.source.value === moduleName
    ) {
      for (const specifier of importDeclaration.node.specifiers) {
        if (
          t.isImportSpecifier(specifier) &&
          t.isIdentifier(specifier.imported) &&
          specifier.imported.name === 'million/react'
        ) {
          importedBindings[specifier.imported.name] = specifier.local.name;
        }
      }
    }
  }

  return importedBindings;
}
