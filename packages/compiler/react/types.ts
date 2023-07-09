import type * as t from '@babel/types';
import type { NodePath } from '@babel/core';

export interface Shared {
  callSitePath: NodePath<t.CallExpression>;
  callSite: t.CallExpression;
  Component: t.VariableDeclarator | t.FunctionDeclaration;
  originalComponent: t.VariableDeclarator | t.FunctionDeclaration;
  importSource: t.StringLiteral;
  globalPath: NodePath;
  isReact: boolean;
  imports: {
    cache: Map<string, t.Identifier>;
    addNamed: (name: string, source?: string) => t.Identifier;
  };
}

export interface Dynamics {
  cache: Set<string>;
  data: {
    id: t.Identifier;
    value: t.Expression | null;
  }[];
  deferred: (() => void)[];
}
