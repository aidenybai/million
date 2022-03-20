import type { VNode, VProps } from '../million/types';
import { h } from '../shared/h';
import type { FC, JSXVNode } from './types';

const jsx = (tag: string | FC, props?: VProps, key?: string | null): VNode => {
  if (typeof tag === 'function') return tag(props, key);
  let children: JSXVNode[] = [];
  if (props) {
    if (props.children) {
      children = <JSXVNode[]>(Array.isArray(props.children) ? props.children : [props.children]);
    }
    delete props.children;
    if (key) props.key = key;
  }
  return h(tag, props, ...children);
};

const Fragment = (props?: VProps): VNode[] | undefined =>
  <VNode[] | undefined>(<unknown>props?.children);

export { h, jsx, jsx as jsxs, Fragment };
