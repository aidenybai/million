// @ts-expect-error - override react.d.ts
// prettier-ignore
import type { ReactNode } from 'react';
import type { VNode } from '../million';

export const unwrap = (vnode?: ReactNode): VNode => {
  if (typeof vnode !== 'object' || vnode === null || !('type' in vnode)) {
    if (typeof vnode === 'number' || vnode === true) {
      return String(vnode);
    } else if (!vnode) {
      return undefined;
    }
    return vnode as VNode;
  }
  if (typeof vnode.type === 'function') {
    const type = vnode.type;
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
    type: vnode.type, // lets pretend no function go through
    props,
  };
};

export const flatten = <T>(rawChildren: T): T[] => {
  if (rawChildren === undefined || rawChildren === null) return [];
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
