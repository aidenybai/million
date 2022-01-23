import { expect } from 'vitest';
import { DOMNode, VNode } from '../src/types/base';

export const expectEqualNode = (el1: DOMNode, el2: DOMNode) => {
  expect(el1.isEqualNode(el2)).toBeTruthy();
};

export const expectEqualVNode = (vnode1: VNode, vnode2: VNode) => {
  expect(JSON.stringify(vnode1)).toEqual(JSON.stringify(vnode2));
};
