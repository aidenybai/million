import { Fragment, createContext, createElement, isValidElement } from 'react';
import { createPortal } from 'react-dom';
import type { ComponentProps, ReactNode, Ref } from 'react';
import type { VNode } from '../million';
import type { MillionPortal } from '../types';
import { REGISTRY, RENDER_SCOPE } from './constants';

export const scopedContext = createContext<boolean>(false);

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
    if (
      isValidElement(value) ||
      (Array.isArray(value) && value.length && isValidElement(value[0]))
    ) {
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

const wrap = (vnode: ReactNode, key?: string): ReactNode => {
  return createElement(
    RENDER_SCOPE,
    { suppressHydrationWarning: true, id: key },
    vnode,
  );
};

export const renderReactScope = (
  vnode: ReactNode,
  unstable: boolean,
  portals: MillionPortal[] | undefined,
  currentIndex: number,
  key?: string,
) => {
  const el = portals?.[currentIndex]?.current;

  const isBlock =
    isValidElement(vnode) &&
    typeof vnode.type === 'function' &&
    '_c' in vnode.type;
  const isCallable = isBlock && (vnode.type as any)._c;

  if (typeof window === 'undefined') {
    if (isBlock) {
      if (isCallable) {
        return vnode;
      }
      return wrap(wrap(vnode), key);
    }
    return wrap(vnode, key);
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

  const current =
    el ??
    (key ? document.getElementById(key) : null) ??
    document.createElement(RENDER_SCOPE);
  const reactPortal = createPortal(
    createElement(Fragment, { children: vnode }),
    current,
    key,
  );

  const millionPortal = {
    foreign: true as const,
    current,
    portal: reactPortal,
    reset: (child: Node) => {
      child.childNodes.forEach((cn) => child.removeChild(cn));
    },
    unstable,
  };
  if (portals) {
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
