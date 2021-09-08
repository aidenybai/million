import { className, m, style, svg, VDelta, VElement, VFlags, VNode, VProps } from './index';

type JSXVNode = VNode | number | boolean | undefined | null;
type FC = (props?: VProps, children?: VNode[], delta?: VDelta) => VElement;

const h = (tag: string, props?: VProps, children?: VNode[], delta?: VDelta) => {
  let flag = VFlags.NO_CHILDREN;
  if (children) {
    const keyCache = new Set();
    flag = VFlags.ANY_CHILDREN;
    if (children.every((child) => typeof child === 'string')) {
      flag = VFlags.ONLY_TEXT_CHILDREN;
    }
    for (const child of children) {
      if (typeof child === 'object' && child.key) {
        keyCache.add(child.key);
      }
    }
    if (keyCache.size === children.length) {
      flag = VFlags.ONLY_KEYED_CHILDREN;
    }
  }
  if (typeof props?.className === 'object') {
    props.className = className(<Record<string, boolean>>(<unknown>props.className));
  }
  if (typeof props?.style === 'object') {
    props.style = style(<Record<string, string>>(<unknown>props.style));
  }

  const vnode = m(tag, props, children, flag, delta);
  return tag === 'svg' ? svg(vnode) : vnode;
};

const normalizeChildren = (children: JSXVNode[], normalizedChildren: VNode[]) => {
  if (!children || children.length === 0) return undefined;
  for (const child of children) {
    if (child !== undefined && child !== null && child !== false && child !== '') {
      if (Array.isArray(child)) {
        normalizeChildren(child, normalizedChildren);
      } else if (
        typeof child === 'string' ||
        typeof child === 'number' ||
        typeof child === 'boolean'
      ) {
        normalizedChildren.push(String(child));
      } else {
        normalizedChildren.push(child);
      }
    }
  }
  return normalizedChildren;
};

const jsx = (tag: string | FC, props?: VProps, ...children: JSXVNode[]): VNode | (() => VNode) => {
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
  }
  const normalizedChildren = normalizeChildren(children, []);
  if (typeof tag === 'function') {
    return tag(props, normalizedChildren, delta);
  } else {
    return h(tag, props, normalizedChildren, delta);
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

export { JSX, jsx, jsx as jsxs, Fragment };
