import type * as t from '@babel/types';

export interface NamedImportDefinition {
  name: string;
  source: string;
  kind: 'named';
}

export interface DefaultImportDefinition {
  source: string;
  kind: 'default';
}

export type ImportDefinition = NamedImportDefinition | DefaultImportDefinition;

export interface StateContext {
  auto: boolean;
  hmr: boolean;
  server: boolean;
  definitions: {
    identifiers: Map<t.Identifier, ImportDefinition>;
    namespaces: Map<t.Identifier, ImportDefinition[]>;
  };
  imports: Map<string, t.Identifier>;
}

export interface CompilerOptions {
  hmr?: boolean;
  server?: boolean;
  auto?: boolean;
}