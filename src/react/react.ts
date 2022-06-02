import { Fragment, h, jsx, jsxs } from '../jsx-runtime';
import { startTransition } from '../million/scheduler';
import { VNode } from '../million/types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from './hooks';

const cloneElement = (vnode: VNode) => {
  if (typeof vnode === 'string') return vnode;
  return h(vnode.tag, vnode.props, ...(vnode.children ?? []));
};

const isValidElement = (vnode: VNode) => {
  if (vnode) {
    if (typeof vnode === 'string') return true;
    if (vnode.tag) return true;
  }
  return false;
};

const memo =
  (
    // eslint-disable-next-line @typescript-eslint/ban-types
    component: Function,
    areEqual: (prev: Record<string, any>, next: Record<string, any>) => boolean,
  ) =>
  () => {
    let lastProps: Record<string, any>;
    let lastResult: VNode;
    return (props: Record<string, any>) => {
      const isEqual =
        areEqual ??
        ((prev, next) =>
          prev === next || Object.entries(prev).toString() === Object.entries(next).toString());

      if (isEqual(lastProps, props)) {
        return lastResult;
      } else {
        const result = component();
        lastResult = result;
        return result;
      }
    };
  };

const toChildArray = (children: VNode[]): VNode[] => {
  return h('_', {}, ...children).children;
};

const mapFn = (children: VNode[], fn: (this: VNode) => VNode) => {
  if (children == null) return null;
  return toChildArray(toChildArray(children).map(fn));
};

const Children = {
  map: mapFn,
  forEach: mapFn,
  count(children: VNode[]) {
    return children ? toChildArray(children).length : 0;
  },
  only(children: VNode[]) {
    const normalized = toChildArray(children);
    if (normalized.length !== 1) throw 'Children.only';
    return normalized[0];
  },
  toArray: toChildArray,
};

export {
  // __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  // act as unstable_act,
  Children,
  // Component,
  Fragment,
  // Profiler,
  // PureComponent,
  // StrictMode,
  // Suspense,
  // SuspenseList,
  // SuspenseList as unstable_SuspenseList,
  cloneElement,
  createContext,
  h as createElement,
  // createMutableSource,
  // createMutableSource as unstable_createMutableSource,
  // createRef,
  // createServerContext,
  // forwardRef,
  isValidElement,
  // lazy,
  memo,
  startTransition,
  startTransition as unstable_startTransition, // TODO: Remove once call sights updated to startTransition
  // unstable_Cache,
  // unstable_DebugTracingMode,
  // unstable_LegacyHidden,
  // unstable_Offscreen,
  // unstable_Scope,
  // unstable_getCacheSignal,
  // unstable_getCacheForType,
  // unstable_useCacheRefresh,
  // useId,
  useCallback,
  useContext,
  // useDebugValue,
  // useDeferredValue,
  // useDeferredValue as unstable_useDeferredValue,
  useEffect,
  // useImperativeHandle,
  // useInsertionEffect,
  useLayoutEffect,
  useMemo,
  // useMutableSource,
  // useMutableSource as unstable_useMutableSource,
  useReducer,
  useRef,
  useState,
  // useSyncExternalStore,
  // useTransition,
  // useTransition as unstable_useTransition,
  jsx,
  jsxs,
  jsx as jsxDEV,
};
