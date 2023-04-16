import type { ReactNode } from 'react';
import type { VNode } from '../million';

const FRAGMENT_SYMBOL = Symbol('react.fragment');

export const unwrap = (vnode?: ReactNode): VNode => {
  if (typeof vnode !== 'object' || vnode === null || !('type' in vnode)) {
    if (typeof vnode === 'number' || vnode === true) {
      return String(vnode);
    } else if (!vnode) {
      return undefined;
    }
    return vnode as VNode;
  }
  const type = vnode.type as any;
  if (typeof type === 'function') {
    return unwrap(type(vnode.props));
  }

  const props = { ...vnode.props };
  const children = vnode.props?.children;
  if (children !== undefined && children !== null) {
    props.children = flatten<ReactNode>(vnode.props.children).map((child) =>
      unwrap(child),
    );
  }

  return {
    type, // lets pretend no function go through
    props,
  };
};

export const flatten = <T>(rawChildren: T): T[] => {
  if (rawChildren === undefined || rawChildren === null) return [];
  if (
    typeof rawChildren === 'object' &&
    'type' in rawChildren &&
    'props' in rawChildren &&
    rawChildren.props &&
    typeof rawChildren.props === 'object' &&
    'children' in rawChildren.props &&
    rawChildren.type === FRAGMENT_SYMBOL
  ) {
    return flatten(rawChildren.props.children as T);
  }
  if (
    !Array.isArray(rawChildren) ||
    (typeof rawChildren === 'object' && '$' in rawChildren)
  ) {
    return [rawChildren];
  }
  const flattenedChildren = rawChildren.flat(Infinity);
  const children: T[] = [];
  for (let i = 0, l = flattenedChildren.length; i < l; ++i) {
    children.push(...flatten<T>(flattenedChildren[i] as any));
  }
  return children;
};
