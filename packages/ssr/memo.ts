/* eslint-disable @typescript-eslint/ban-types */
import { VNode } from '../million/types';
import { toVNode } from './toVNode';

const cache = new Map<string, VNode>();

export const memo = (key: string): VNode | undefined => {
  if (cache.has(key)) {
    return cache.get(key);
  } else {
    const vnode = toVNode(key);
    cache.set(key, vnode);
    return vnode;
  }
};
