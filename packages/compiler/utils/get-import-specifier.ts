import { addNamed, addDefault } from "@babel/helper-module-imports";
import type * as t from '@babel/types'
import type { StateContext, ImportDefinition } from "../types";

export function getImportIdentifier(
  state: StateContext,
  path: babel.NodePath,
  registration: ImportDefinition,
): t.Identifier {
  const name = registration.kind === 'named'
    ? registration.name
    : 'default';
  const target = `${registration.source}[${name}]`;
  const current = state.imports.get(target);
  if (current) {
    return current;
  }
  const newID = (registration.kind === 'named')
    ? addNamed(path, registration.name, registration.source)
    : addDefault(path, registration.source);
  state.imports.set(target, newID);
  return newID;
}