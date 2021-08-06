import { m, VNode, VProps, VElement, VFlags, VDelta, className, style, svg } from './index';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace JSXInternal {
  export type Element = VElement;
  export interface IntrinsicElements {
    [elemName: string]: VProps;
  }
}

export type JSXVNode = VNode | number | boolean | undefined | null;
export type FC = (props?: VProps, children?: VNode[], delta?: VDelta) => VElement;

const h = (tag: string, props?: VProps, children?: VNode[], delta?: VDelta) => {
  let type = VFlags.NO_CHILDREN;
  if (children) {
    type = VFlags.ANY_CHILDREN;
    if (children.some((child) => typeof child === 'string')) {
      type = VFlags.ONLY_TEXT_CHILDREN;
    }
  }
  if (props) {
    if (props.className && typeof props.className === 'object') {
      props.className = className(props.className);
    }
    if (props.style && typeof props.style === 'object') {
      props.style = style(props.style);
    }
  }

  const vnode = m(tag, props, children, type, delta);
  return !props?.ns && tag === 'svg' ? svg(vnode) : vnode;
};

const normalize = (children: JSXVNode[], normalizedChildren: VNode[]) => {
  if (!children || children.length === 0) return undefined;
  for (const child of children) {
    if (child !== undefined && child !== null && child !== false && child !== '') {
      if (Array.isArray(child)) {
        normalize(child, normalizedChildren);
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

const jsx = (tag: string | FC, props?: VProps, ...children: JSXVNode[]): VNode => {
  let delta: VDelta | undefined;
  if (props) {
    if (props.delta && (<VDelta>(<unknown>props.delta)).length > 0) {
      delta = <VDelta>(<unknown>props.delta);
      delete props.delta;
    }
    if (props.children) {
      children = <VNode[]>(<unknown>props.children);
      delete props.children;
    }
  }
  const normalizedChildren = normalize(children, []);
  if (typeof tag === 'function') {
    return tag(props, normalizedChildren, delta);
  } else {
    return h(tag, props, normalizedChildren, delta);
  }
};

const Fragment = (props?: VProps): VNode[] | undefined => <VNode[] | undefined>props?.children;

export { jsx, jsx as jsxs, Fragment };
