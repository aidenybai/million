// It is not recommended to edit this file unless you absolutely know what you are doing.
// Please update scripts/fix-jsx-runtime.mjs accordingly.

import { className, m, style, svg, VDelta, VElement, VFlags, VNode, VProps } from './index';
import { kebab } from './m';

type JSXVNode = VNode | number | boolean | undefined | null;
type FC = (props?: VProps, children?: VNode[], delta?: VDelta) => VElement;

const h = (tag: string, props?: VProps, children?: JSXVNode[], delta?: VDelta) => {
  let flag = VFlags.NO_CHILDREN;
  const normalizedChildren: VNode[] = [];
  if (children) {
    children = Array.isArray(children) ? children : [children];
    const keysInChildren = new Set();
    let hasVElementChildren = false;
    flag = VFlags.ANY_CHILDREN;

    if (children.every((child) => typeof child === 'string')) {
      flag = VFlags.ONLY_TEXT_CHILDREN;
    }
    for (let i = 0; i < children.length; i++) {
      if (
        children[i] !== undefined &&
        children[i] !== null &&
        children[i] !== false &&
        children[i] !== ''
      ) {
        const unwrappedChild = <VNode>normalize(children[i]);
        const subChildren = Array.isArray(unwrappedChild) ? unwrappedChild : [unwrappedChild];

        for (let i = 0; i < subChildren.length; i++) {
          if (subChildren[i] || subChildren[i] === '') {
            normalizedChildren.push(subChildren[i]);
            if (typeof subChildren[i] === 'object') {
              if (!hasVElementChildren) hasVElementChildren = true;
              if (typeof subChildren[i].key === 'string' && subChildren[i].key !== '') {
                keysInChildren.add(subChildren[i].key);
              }
            }
          }
        }
      }
    }
    if (keysInChildren.size === children.length) {
      flag = VFlags.ONLY_KEYED_CHILDREN;
    }
    if (!hasVElementChildren) {
      flag = VFlags.ONLY_TEXT_CHILDREN;
    }
  }
  if (props) {
    if (typeof props.className === 'object') {
      props.className = className(<Record<string, boolean>>(<unknown>props.className));
    }
    if (typeof props.style === 'object') {
      const rawStyle = <Record<string, string>>(<unknown>props.style);
      const normalizedStyle = Object.keys(rawStyle).some((key) => /[-A-Z]/gim.test(key))
        ? kebab(rawStyle)
        : rawStyle;
      props.style = style(<Record<string, string>>normalizedStyle);
    }
  }

  const vnode = m(tag, props, normalizedChildren, flag, delta);
  return tag === 'svg' ? svg(vnode) : vnode;
};

const normalize = (jsxVNode: JSXVNode): VNode | VNode[] | undefined => {
  if (Array.isArray(jsxVNode)) {
    const normalizedChildren: VNode[] = [];
    for (let i = 0; i < jsxVNode.length; i++) {
      normalizedChildren.push(<VNode>normalize(jsxVNode[i]));
    }
    return normalizedChildren;
  } else if (
    typeof jsxVNode === 'string' ||
    typeof jsxVNode === 'number' ||
    typeof jsxVNode === 'boolean'
  ) {
    return String(jsxVNode);
  } else {
    return <VNode>jsxVNode;
  }
};

const jsx = (
  tag: string | FC,
  props?: VProps,
  key?: string | null,
  ...children: JSXVNode[]
): VNode => {
  let delta: VDelta | undefined;
  if (props) {
    const rawDelta = <VDelta>(<unknown>props.delta);
    if (props.delta && rawDelta.length > 0) {
      delta = rawDelta;
      delete props.delta;
    }
    if (props.children) {
      children = <VNode[]>(<unknown>props.children);
      delete props.children;
    }
    if (key) props.key = key;
  }
  if (typeof tag === 'function') {
    return tag(props, <VNode[]>children, delta);
  } else {
    return h(tag, props, children, delta);
  }
};

const Fragment = (props?: VProps): VNode[] | undefined => <VNode[] | undefined>props?.children;

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace JSX {
  export type Element = VNode;
  export interface IntrinsicElements {
    [elemName: string]: VProps;
  }
}

export { JSX, JSXVNode, FC, jsx, jsx as jsxs, Fragment };
