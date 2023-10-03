import * as _unplugin from 'unplugin';
import * as _babel_core from '@babel/core';
import { NodePath } from '@babel/core';
import * as t from '@babel/types';

declare const _default: (
  api: object,
  options: Record<string, any> | null | undefined,
  dirname: string,
) => {
  name: string;
  visitor: {
    CallExpression(
      this: _babel_core.PluginPass,
      path: NodePath<t.CallExpression>,
    ): void;
  };
};

interface UserOptions {
  ignoreFiles?: string[];
  memo?: boolean;
  mode: 'react' | 'next' | 'react-server' | 'optimize';
}

declare const unplugin: _unplugin.UnpluginInstance<
  UserOptions | undefined,
  boolean
>;
declare const next: (nextConfig?: Record<string, any>) => {
  webpack(config: Record<string, any>, options: Record<string, any>): any;
};

export { _default as babelPlugin, unplugin as default, next, unplugin };
