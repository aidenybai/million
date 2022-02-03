/* eslint-disable @typescript-eslint/ban-types */
import { VNode } from '../million/types';

const cache = new Map<string, VNode>();

export const needsPatch = (key: string): boolean => !cache.has(key);

export const memo = (el: HTMLElement, key: string, toVNode: Function): VNode | undefined => {
  if (cache.has(key)) {
    return cache.get(key);
  } else {
    const vnode = <VNode>toVNode(el);
    cache.set(key, vnode);
    return vnode;
  }
};
