import { Fragment, isValidElement } from 'react';
import { createRoot } from 'react-dom/client';
import { REACT_ROOT, RENDER_SCOPE } from './constants';
import type { ReactNode } from 'react';
import type { Root } from 'react-dom/client';
import type { VNode } from '../million';

export const processProps = <P extends object>(props: P) => {
  // TODO: eventually need to handle all props, but need to analyze performance impact
  if ('children' in props && isValidElement(props.children)) {
    props.children = renderReactScope(props.children);
  }
  return props;
};

export const renderReactScope = (vnode: ReactNode) => {
  return (el: HTMLElement | null) => {
    const parent = el ?? document.createElement(RENDER_SCOPE);
    const root =
      REACT_ROOT in parent
        ? (parent[REACT_ROOT] as Root)
        : (parent[REACT_ROOT] = createRoot(parent));
    root.render(vnode);
    return parent;
  };
};

export const unwrap = (vnode: JSX.Element): VNode => {
  if (typeof vnode !== 'object' || vnode === null || !('type' in vnode)) {
    if (typeof vnode === 'number') {
      return String(vnode);
    }
    return vnode;
  }
  
  const type = vnode.type;
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
  rawChildren?: JSX.Element,
): JSX.Element[] => {
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
  const children: JSX.Element[] = [];
  for (let i = 0, l = flattenedChildren.length; i < l; ++i) {
    children.push(...flatten(flattenedChildren[i]));
  }
  return children;
};
