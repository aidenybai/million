import { handleBlock } from './template';
import type { PluginObj } from '@babel/core';

export const plugin = (): PluginObj => {
  return {
    name: 'million',
    visitor: {
      CallExpression: handleBlock,
    },
  };
};
