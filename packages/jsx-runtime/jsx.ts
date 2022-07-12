import { compat } from '../react/compat';
import { h } from './h';
import type { VNode, VProps } from '../million/types';
import type { FC, RawVNode } from './types';

function jsxRaw(
  this: any,
  tag: string | FC,
  props?: VProps,
  key?: string,
): VNode | VNode[] {
  let children: RawVNode[] = [];
  if (props) {
    if (props.children) {
      children = Array.isArray(props.children)
        ? props.children
        : [props.children];
    }
    props.children = undefined;
    if (key) props.key = key;
  }
  return h(tag, props, ...children);
}

const jsx = compat(jsxRaw);

const Fragment = (props?: VProps): VNode[] | undefined =>
  props?.children as VNode[] | undefined;

export { h, jsx, jsx as jsxs, jsxRaw, Fragment };
