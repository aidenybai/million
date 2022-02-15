import { VNode } from '../million/types';
import { fromStringToDomNode, fromDomNodeToVNode } from '../shared/convert';

const cache = new Map<string, VNode | undefined>();

export const memo = (key: string): VNode | undefined => {
  if (cache.has(key)) {
    return cache.get(key);
  } else {
    const vnode = fromDomNodeToVNode(fromStringToDomNode(key));
    cache.set(key, vnode);
    return vnode;
  }
};
