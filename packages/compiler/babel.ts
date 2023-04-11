import { declare } from '@babel/helper-plugin-utils';
import { optimizeInternal } from './internal';
import { optimizeReact } from './react';

export default declare((api, options) => {
  api.assertVersion(7);
  return {
    name: 'million',
    visitor: {
      CallExpression: options.react ? optimizeReact : optimizeInternal,
    },
  };
});
