import { Fragment, createElement, isValidElement } from 'react';
import { createPortal } from 'react-dom';
import type {
  ComponentProps,
  DispatchWithoutAction,
  ReactNode,
  Ref,
} from 'react';
import type { VNode } from '../million';
import type { MillionPortal } from '../types';

// TODO: access perf impact of this
export const processProps = (
  props: ComponentProps<any>,
  ref: Ref<any>,
  portals: MillionPortal[],
): ComponentProps<any> => {
  const processedProps: ComponentProps<any> = { ref };

  let currentIndex = 0;

  for (const key in props) {
    const value = props[key];
    if (isValidElement(value)) {
      processedProps[key] = renderReactScope(
        value,
        false,
        portals,
        currentIndex++,
      );

      continue;
    }
    processedProps[key] = props[key];
  }

  return processedProps;
};

export const renderReactScope = (
  vnode: ReactNode,
  unstable: boolean,
  portals: MillionPortal[] | undefined,
  currentIndex: number,
  parent: Element,
  rerender: DispatchWithoutAction,
) => {
  const el = portals?.[currentIndex]?.current;

  const isBlock =
    isValidElement(vnode) &&
    typeof vnode.type === 'function' &&
    '_c' in vnode.type;
  const isCallable = isBlock && (vnode.type as any)._c;

  if (typeof window === 'undefined') {
    return vnode;
  }

  if (isCallable) {
    const puppetComponent = (vnode.type as any)(vnode.props);
    if (REGISTRY.has(puppetComponent.type)) {
      const puppetBlock = REGISTRY.get(puppetComponent.type)!;
      if (typeof puppetBlock === 'function') {
        return puppetBlock(puppetComponent.props);
      }
    }
  }

  const reactPortal = createPortal(vnode, parent);

  const millionPortal = {
    foreign: true as const,
    current: parent,
    portal: reactPortal,
    unstable,
  };
  if (portals) {
    if (!portals[currentIndex]) {
      rerender();
    }
    portals[currentIndex] = millionPortal;
  }

  return millionPortal;
};

export const unwrap = (vnode: JSX.Element | null): VNode => {
  if (typeof vnode !== 'object' || vnode === null || !('type' in vnode)) {
    if (typeof vnode === 'number') {
      return String(vnode);
    }
    return vnode;
  }

  let type = vnode.type;
  if (typeof type === 'function') {
    return unwrap(type(vnode.props ?? {}));
  }
  if (typeof type === 'object' && '$' in type) return type;

  const props = { ...vnode.props };
  // emotion support
  if ('css' in props && '__EMOTION_TYPE_PLEASE_DO_NOT_USE__' in props) {
    props.style = props.css.styles;
    type = props.__EMOTION_TYPE_PLEASE_DO_NOT_USE__;
    delete props.__EMOTION_TYPE_PLEASE_DO_NOT_USE__;
    delete props.css;
  }
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

export function convertToJSX(dom: HTMLElement): VNode {
  if (!dom.tagName) {
    return null;
  }

  // Convert 'class' to 'className' and 'for' to 'htmlFor'
  const attributes: Record<string, any> = {};
  for (let i = 0; i < dom.attributes.length; i++) {
    const attrib = dom.attributes[i]!;
    attributes[attrib.name] = attrib.value;
  }

  if (attributes.class) {
    attributes.className = attributes.class;
    delete attributes.class;
  }

  if (attributes.for) {
    attributes.htmlFor = attributes.for;
    delete attributes.for;
  }
  const children: VNode[] = [];
  for (let i = 0; i < dom.children.length; i++) {
    const child = dom.children[i];
    if (child instanceof HTMLElement) {
      children.push(convertToJSX(child)); // Recursively convert nested elements
    } else if (child instanceof Text) {
      children.push(child.textContent);
    }
  }

  return createElement(dom.tagName.toLowerCase(), attributes, ...children);
}
