import type { VNode, VProps } from '../million/types';
import { h } from './h';
import type { FC, RawVNode } from './types';

const jsx = (tag: string | FC, props?: VProps, key?: string | null): VNode => {
  if (typeof tag === 'function') return tag(props, key);
  let children: RawVNode[] = [];
  if (props) {
    if (props.children) {
      children = Array.isArray(props.children) ? props.children : [props.children];
    }
    props.children = undefined;
    if (key) props.key = key;
  }
  return h(tag, props, ...children);
};

const Fragment = (props?: VProps): VNode[] | undefined => props?.children as VNode[] | undefined;

export { h, jsx, jsx as jsxs, Fragment };
