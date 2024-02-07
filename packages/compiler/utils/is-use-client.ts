import type * as t from '@babel/types';

export const isUseClient = (directives: t.Directive[]): boolean => {
  const directivesLength = directives.length;
  if (!directivesLength) return false; // we assume it's server component only
  for (let i = 0; i < directivesLength; ++i) {
    const directive = directives[i];
    if (directive?.value.value === 'use client') return true;
  }
  return false;
};
