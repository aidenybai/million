import * as t from '@babel/types';
import type { ImportDefinition, StateContext } from '../types';

function getImportSpecifierName(specifier: t.ImportSpecifier): string {
  if (t.isIdentifier(specifier.imported)) {
    return specifier.imported.name;
  }
  return specifier.imported.value;
}

export function registerImportDefinition(
  ctx: StateContext,
  path: babel.NodePath<t.ImportDeclaration>,
  definition: ImportDefinition,
): void {
  if (path.node.importKind === 'typeof' || path.node.importKind === 'type') {
    return;
  }
  for (let i = 0, len = path.node.specifiers.length; i < len; i++) {
    const specifier = path.node.specifiers[i]!;
    if (t.isImportDefaultSpecifier(specifier)) {
      if (definition.kind === 'default') {
        ctx.definitions.identifiers.set(specifier.local, definition);
      }
    } else if (t.isImportNamespaceSpecifier(specifier)) {
      let current = ctx.definitions.namespaces.get(specifier.local);
      if (!current) {
        current = [];
      }
      current.push(definition);
      ctx.definitions.namespaces.set(specifier.local, current);
    } else if (
      !(specifier.importKind === 'typeof' || specifier.importKind === 'type')
    ) {
      const key = getImportSpecifierName(specifier);
      if (
        (definition.kind === 'named' && key === definition.name) ||
        (definition.kind === 'default' && key === 'default')
      ) {
        ctx.definitions.identifiers.set(specifier.local, definition);
      }
    }
  }
}
