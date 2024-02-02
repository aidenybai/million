import type { NodePath } from '@babel/core';
import { addNamed } from '@babel/helper-module-imports';
import type * as t from '@babel/types';
import type { Info } from '../babel';
import type { Options } from '../plugin';

export const resolveImportSource = (options: Options, source: string): string | null => {
  if (!source.startsWith('million/react')) return null;
  const mode = options.mode || 'react';
  if (options.server) {
    return `million/${mode}-server`;
  }
  return `million/${mode}`;
};

export const addImport = (
  path: NodePath,
  name: string,
  source: string,
  info: Info
): t.Identifier => {
  const hasProgramBinding = info.programPath.scope.hasBinding(name);
  const hasLocalBinding = path.scope.hasBinding(name);

  if (info.imports[name] && hasProgramBinding && hasLocalBinding) {
    return info.imports[name];
  }

  const id = addNamed(info.programPath, name, source);

  if (info.imports.source === source && name in info.imports) {
    if (!info.imports[name]) {
      info.imports[name] = id.name;
      info.imports.aliases[name] = new Set([id.name]);
    }
    info.imports.aliases[name].add(name);
  }
  return id;
};

export const isUseClient = (directives: t.Directive[]): boolean => {
  const directivesLength = directives.length;
  if (!directivesLength) return false; // we assume it's server component only
  for (let i = 0; i < directivesLength; ++i) {
    const directive = directives[i];
    if (directive?.value.value === 'use client') return true;
  }
  return false;
};
