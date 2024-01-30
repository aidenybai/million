import {
  Fragment,
  Suspense,
  createElement,
  isValidElement,
  memo,
  startTransition,
  useEffect,
  useInsertionEffect,
  useLayoutEffect,
  useTransition,
} from 'react';
import { createPortal, flushSync } from 'react-dom';
import type {
  ComponentProps,
  DispatchWithoutAction,
  ReactElement,
  ReactNode,
  Ref,
} from 'react';
import afterframe from 'afterframe'
import type { VNode } from '../million';
import type { MillionPortal } from '../types';
import { REGISTRY } from './constants';

const reactPortal = createPortal('', document.createDocumentFragment());

function isPortal(el: any) {
  if (typeof el === 'object' && el['$$typeof'] === reactPortal['$$typeof']) {
    return true;
  }
  return false;
}

// TODO: access perf impact of this
export const processProps = (
  props: ComponentProps<any>,
  ref: Ref<any>,
  portals: MillionPortal[]
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
        currentIndex++
      );

      continue;
    }
    // if ((Array.isArray(value) && value.length && isPortal(value[0]))) {
    //   portals[currentIndex++] = { portal: props[key] }
    // }
    processedProps[key] = props[key];
  }

  return processedProps;
};

const Component = memo(
  ({ parent, vnode, millionPortal, rerender }) => {
    // if (parent) {
    //   millionPortal.p?.pongResolve()
    //   return vnode;
    // }
    const [isPending, startTransition] = useTransition()
    // debugger

    !millionPortal.p?.parent && startTransition(() => {
      // console.log(vnode, isValidElement(vnode))
      // if (!millionPortal.p?.parent) {
        throw millionPortal.p!.pingPromise;
      // }
    });
    
    
    useEffect(() => {
      if (!isPending) {
        afterframe(millionPortal.p.pongResolve)
      }
    }, [isPending])
    // console.log(vnode, millionPortal.p.parent)

    // if (!rerender) {
    // TOOD: maybe we should have a template here and when we inject the content, we get things out of that template, so the unmount does not fail
      return vnode === null || vnode === undefined  || vnode === '' ? null :  createElement('template', null, vnode) 
      // return vnode 
    // } else {
      // return createPortal(vnode, millionPortal.p!.parent!);
    // }
  },
  (prev, next) => prev.vnode === next.vnode
);

export const renderReactScope = (
  vnode: ReactNode,
  unstable: boolean,
  portals: MillionPortal[] | undefined,
  currentIndex: number,
  parentEl?: Element,
  rerender?: DispatchWithoutAction,
  key?: string
) => {
  const isBlock =
    isValidElement(vnode) &&
    typeof vnode.type === 'function' &&
    '_c' in vnode.type;
  const isCallable = isBlock && (vnode.type as any)._c;

  if (typeof window === 'undefined') {
    return vnode;
  }

  const prevPortal = portals?.[currentIndex];

  if (isCallable) {
    const puppetComponent = (vnode.type as any)(vnode.props);
    if (REGISTRY.has(puppetComponent.type)) {
      const puppetBlock = REGISTRY.get(puppetComponent.type)!;
      if (typeof puppetBlock === 'function') {
        return puppetBlock(puppetComponent.props);
      }
    }
  }

  
  const el = prevPortal?.current || document.createElement('template').content;
  const millionPortal = {} as MillionPortal;
  // console.log(key, vnode)
  const reactPortal = createPortal(
    createElement(Suspense, {
      children: createElement(Component, { millionPortal, parent: parentEl, vnode, rerender }),
      fallback: null,
    }),
    el,
    key
  );

  Object.assign(millionPortal, {
    foreign: true as const,
    current: el,
    portal: reactPortal,
    unstable,
    rerender,
    _d_vnode: vnode
  });
  if (!prevPortal) {
  // if (!parent) {
    let pingResolve = (value: null) => {};
    let pongResolve = (value: null) => {};
    const p  = {
      parent: null,
      pingPromise: new Promise<null>((res) => (pingResolve = res)),
      pingResolve,
      pongPromise: new Promise<null>((res) => (pongResolve = res)),
      pongResolve,
      boundaries: [document.createComment(`portal ${key} start`), document.createComment(`portal ${key} end`)]
    } satisfies MillionPortal['p'];
    p.pingResolve = pingResolve;
    p.pongResolve = pongResolve;

    millionPortal.p = p;
  }
  if (prevPortal) {
    millionPortal.p = prevPortal.p;
  }
  if (portals) {
    if (!prevPortal) {
      rerender?.();
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
      unwrap(child)
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
