import { declare } from '@babel/helper-plugin-utils';
import { optimize } from './optimize';
import { transformReact } from './react';
import type * as t from '@babel/types';
import type { NodePath } from '@babel/core';

export default declare((api, options) => {
  api.assertVersion(7);
  const callExpressionHandler =
    options.mode === 'optimize' ? optimize : transformReact(options);
  return {
    name: 'million',
    visitor: {
      CallExpression(path: NodePath<t.CallExpression>) {
        callExpressionHandler(path);
      },
    },
  };
});
