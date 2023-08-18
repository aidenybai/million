import { Fragment, createElement, isValidElement, version } from 'react';
import { REACT_ROOT, REGISTRY, RENDER_SCOPE } from './constants';
import type { ComponentProps, ReactNode, Ref } from 'react';
import type { VNode } from '../million';

// TODO: access perf impact of this
export const processProps = (props: ComponentProps<any>, ref: Ref<any>) => {
  const processedProps: ComponentProps<any> = { ref };

  for (const key in props) {
    const value = props[key];
    if (isValidElement(value)) {
      processedProps[key] = renderReactScope(value);
      continue;
    }
    processedProps[key] = props[key];
  }

  return processedProps;
};

export const renderReactScope = (vnode: ReactNode, unstable?: boolean) => {
  if (typeof window === 'undefined') {
    return createElement(
      RENDER_SCOPE,
      { suppressHydrationWarning: true },
      vnode,
    );
  }

  if (
    isValidElement(vnode) &&
    typeof vnode.type === 'function' &&
    'callable' in vnode.type
  ) {
    const puppetComponent = (vnode.type as any)(vnode.props);
    if (REGISTRY.has(puppetComponent.type)) {
      const puppetBlock = REGISTRY.get(puppetComponent.type)!;
      if (typeof puppetBlock === 'function') {
        return puppetBlock(puppetComponent.props);
      }
    }
  }

  const scope = (el: HTMLElement | null) => {
    let root;
    const parent = el ?? document.createElement(RENDER_SCOPE);
    if (version.startsWith('18')) {
      import('react-dom/client')
        .then((res) => {
          root =
            REACT_ROOT in parent
              ? parent[REACT_ROOT]
              : (parent[REACT_ROOT] = res.createRoot(parent));
          root.render(vnode);
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error(e);
        });
    } else {
      root = parent[REACT_ROOT];
      root.render(vnode);
    }
    return parent;
  };

  if (unstable) scope.unstable = true;

  return scope;
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
