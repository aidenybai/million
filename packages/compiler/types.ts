import type * as t from '@babel/types';
import { Options } from './options';

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
  log: Options['log'];
  auto: Options['auto'];
  hmr: boolean;
  server: boolean;
  definitions: {
    identifiers: Map<t.Identifier, ImportDefinition>;
    namespaces: Map<t.Identifier, ImportDefinition[]>;
  };
  imports: Map<string, t.Identifier>;
}

export interface CompilerOptions {
  log?: boolean;
  hmr?: boolean;
  server?: boolean;
  auto?: boolean;
}
