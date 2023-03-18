import { declare } from '@babel/helper-plugin-utils';
import { visitCallExpression } from './visitor';

export default declare((api) => {
  api.assertVersion(7);
  return {
    name: 'million',
    visitor: {
      CallExpression: visitCallExpression,
    },
  };
});
