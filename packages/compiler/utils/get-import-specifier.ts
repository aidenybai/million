import type * as babel from '@babel/core';
import * as t from '@babel/types';
import type { ImportDefinition, StateContext } from '../types';

export function getImportIdentifier(
  state: StateContext,
  path: babel.NodePath,
  registration: ImportDefinition,
): t.Identifier {
  const name = registration.kind === 'named' ? registration.name : 'default';
  const target = `${registration.source}[${name}]`;
  const current = state.imports.get(target);
  if (current) {
    return current;
  }
  const programParent = path.scope.getProgramParent();
  const uid = programParent.generateUidIdentifier(
    registration.kind === 'named' ? registration.name : 'default',
  );
  const newPath = (
    programParent.path as babel.NodePath<t.Program>
  ).unshiftContainer(
    'body',
    t.importDeclaration(
      [
        registration.kind === 'named'
          ? t.importSpecifier(uid, t.identifier(registration.name))
          : t.importDefaultSpecifier(uid),
      ],
      t.stringLiteral(registration.source),
    ),
  )[0];
  programParent.registerDeclaration(newPath);
  state.imports.set(target, uid);
  return uid;
}
