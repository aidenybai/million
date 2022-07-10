import { fromDomNodeToVNode, fromStringToDomNode } from '../utils';
import type { DOMNode, VNode } from '../million/types';

const cache = new Map<DOMNode | string, VNode>();

export const memo = (node: DOMNode | string): VNode | undefined => {
  const key =
    typeof node === 'string'
      ? node
      : node instanceof HTMLElement
      ? node.outerHTML
      : node.textContent!;

  if (cache.has(key)) {
    return cache.get(key);
  }
  const vnode = fromDomNodeToVNode(
    typeof node === 'string' ? fromStringToDomNode(node) : node,
  );
  cache.set(key, vnode!);
  return vnode;
};
