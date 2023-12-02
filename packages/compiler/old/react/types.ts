import type * as t from '@babel/types';
import type { NodePath } from '@babel/core';

export interface Shared {
  file: string;
  callSitePath: NodePath<t.CallExpression>;
  callSite: t.CallExpression;
  Component: t.VariableDeclarator | t.FunctionDeclaration;
  RawComponent: t.Identifier | t.FunctionExpression | t.ArrowFunctionExpression;
  blockCache: Map<string, t.Identifier>;
  originalComponent: t.VariableDeclarator | t.FunctionDeclaration;
  importSource: t.StringLiteral;
  globalPath: NodePath;
  isReact: boolean;
  unstable: boolean;
  imports: {
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
  portalInfo: {
    index: number;
    id: t.Identifier;
  };
}
