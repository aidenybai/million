import { VNode } from '../million/types';
import { fromStringToVNode } from '../shared/convert';

const cache = new Map<string, VNode>();

export const memo = (key: string): VNode | undefined => {
  if (cache.has(key)) {
    return cache.get(key);
  } else {
    const vnode = fromStringToVNode(key);
    cache.set(key, vnode);
    return vnode;
  }
};
