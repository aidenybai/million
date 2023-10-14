import { render, Fragment, isValidElement } from 'preact';
import { RENDER_SCOPE } from './constants';
import type { VNode as PreactNode, ComponentProps } from 'preact';
import type { VNode } from '../million';

export const processProps = (props: ComponentProps<any>) => {
  const processedProps: ComponentProps<any> = {};

  for (const key in props) {
    const value = props[key];
    if (isValidElement(value)) {
      processedProps[key] = renderPreactScope(value);
      continue;
    }
    processedProps[key] = props[key];
  }

  return processedProps;
};

export const renderPreactScope = (vnode: PreactNode) => {
  return (el: HTMLElement | null) => {
    const parent = el ?? document.createElement(RENDER_SCOPE);
    render(vnode, parent);
    return parent;
  };
};

export const unwrap = (vnode: JSX.Element): VNode => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (typeof vnode !== 'object' || vnode === null || !('type' in vnode)) {
    if (typeof vnode === 'number') {
      return String(vnode);
    }
    return vnode as VNode;
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

export const flatten = (rawChildren?: JSX.Element | null): JSX.Element[] => {
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
