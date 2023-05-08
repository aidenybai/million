import { declare } from '@babel/helper-plugin-utils';
import * as t from '@babel/types';
import { optimize } from './optimize';
import { transformReact } from './react';
import type { NodePath } from '@babel/core';

export default declare((api, options) => {
  api.assertVersion(7);
  const callExpressionHandler =
    options.mode === 'optimize' ? optimize : transformReact(options);
  return {
    name: 'million',
    visitor: {
      CallExpression(path: NodePath<t.CallExpression>) {
        try {
          callExpressionHandler(path);
        } catch (err: any) {
          // eslint-disable-next-line no-console
          console.error(err.message);
          path.parentPath.parentPath?.insertBefore(
            t.callExpression(t.identifier('console.error'), [
              t.stringLiteral(err.message),
            ]),
          );
        }
      },
    },
  };
});
