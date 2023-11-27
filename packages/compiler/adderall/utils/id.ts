import { NodePath } from '@babel/core';
import * as t from '@babel/types';

export const getUniqueId = (path: NodePath, name: string): t.Identifier => {
  const processedName = t
    .toIdentifier(name)
    .replace(/^_+/, '')
    .replace(/[0-9]+$/g, '');

  let uid: string;
  let i = 0;
  do {
    uid = processedName;
    if (i > 1) uid += i;
    i++;
  } while (
    path.scope.hasLabel(uid) ||
    path.scope.hasBinding(uid) ||
    path.scope.hasGlobal(uid) ||
    path.scope.hasReference(uid)
  );

  path.scope.references[uid] = true;
  path.scope.uids[uid] = true;

  return t.identifier(uid);
};
