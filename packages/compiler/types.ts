import type * as t from '@babel/types';
import { Options } from './options';
import { MillionTelemetry } from 'packages/telemetry';

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
  MillionTelemetry: MillionTelemetry;
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
  MillionTelemetry: MillionTelemetry;
  log?: boolean;
  hmr?: boolean;
  server?: boolean;
  auto?: boolean;
}
