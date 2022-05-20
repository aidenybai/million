import { DOMNode, VNode } from '../million/types';
import { fromDomNodeToVNode, fromStringToDomNode } from '../utils';

const cache = new Map<DOMNode | string, VNode>();

export const memo = (key: string): VNode | undefined => {
  if (cache.has(key)) {
    return cache.get(key);
  } else {
    const vnode = fromDomNodeToVNode(fromStringToDomNode(key));
    cache.set(key, vnode!);
    return vnode;
  }
};
