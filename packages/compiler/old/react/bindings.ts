import * as t from '@babel/types';
import type { NodePath } from '@babel/core';

export function collectImportedBindings(path: NodePath<t.Program>): {
  bindings: Record<string, string>;
  aliases: Record<string, string>;
} {
  const bindings: Record<string, string> = {};
  const aliases: Record<string, string> = {};

  const importDeclarations = path
    .get('body')
    .filter((node) => t.isImportDeclaration(node.node));

  for (const importDeclaration of importDeclarations) {
    if (
      t.isImportDeclaration(importDeclaration.node) &&
      importDeclaration.node.source.value.includes('million')
    ) {
      for (const specifier of importDeclaration.node.specifiers) {
        if (
          t.isImportSpecifier(specifier) &&
          t.isIdentifier(specifier.imported)
        ) {
          bindings[specifier.imported.name] = specifier.local.name;
          aliases[specifier.local.name] = specifier.imported.name;
        }
      }
    }
  }

  return { bindings, aliases };
}
