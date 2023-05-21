import { Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import { document$ } from '../million/dom';
import type { ReactNode } from 'react';
import type { Root } from 'react-dom/client';
import type { VNode } from '../million';

const REACT_ROOT = '__react_root';
export const RENDER_SCOPE = 'million-render-scope';

export const renderReactScope = (jsx: ReactNode) => {
  return (el: HTMLElement | null) => {
    const parent = el ?? document$.createElement(RENDER_SCOPE);
    const root =
      REACT_ROOT in parent
        ? (parent[REACT_ROOT] as Root)
        : (parent[REACT_ROOT] = createRoot(parent));
    root.render(jsx);
    return parent;
  };
};

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
    return unwrap(type(vnode.props ?? {}));
  }
  if (typeof type === 'object' && '$' in type) return type;

  const props = { ...vnode.props };
  const children = vnode.props?.children;
  if (children !== undefined && children !== null) {
    props.children = flatten(vnode.props.children).map((child) =>
      unwrap(child),
    );
  }

  return {
    type, // lets pretend no function go through
    props,
  };
};

export const flatten = (
  rawChildren?: ReactNode | ReactNode[] | null,
): ReactNode[] => {
  if (rawChildren === undefined || rawChildren === null) return [];
  if (
    typeof rawChildren === 'object' &&
    'type' in rawChildren &&
    rawChildren.type === Fragment
  ) {
    return flatten(rawChildren.props.children);
  }
  if (
    !Array.isArray(rawChildren) ||
    (typeof rawChildren === 'object' && '$' in rawChildren)
  ) {
    return [rawChildren];
  }
  const flattenedChildren = rawChildren.flat(Infinity);
  const children: (ReactNode | ReactNode[])[] = [];
  for (let i = 0, l = flattenedChildren.length; i < l; ++i) {
    children.push(...flatten(flattenedChildren[i] as any));
  }
  return children;
};
