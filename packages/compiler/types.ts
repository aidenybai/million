import type * as t from '@babel/types';
import type { MillionTelemetry } from 'packages/telemetry';

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

export interface CompilerOptions {
  hmr?: boolean;
  server?: boolean;
  auto?:
    | boolean
    | {
        threshold?: number;
        // @deprecated
        skip?: (string | RegExp)[];
        rsc?: boolean;
      };
  /**
   * @default true
   */
  log?: boolean | 'info';
  /**
   * @default false
   */
  rsc?: boolean;

  telemetry: MillionTelemetry;
}

export interface StateContext {
  options: CompilerOptions;
  definitions: {
    identifiers: Map<t.Identifier, ImportDefinition>;
    namespaces: Map<t.Identifier, ImportDefinition[]>;
  };
  imports: Map<string, t.Identifier>;
  topLevelRSC: boolean;
  serverMode: 'server' | 'client';
}
