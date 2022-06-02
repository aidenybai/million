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

export {
  Fragment,
  cloneElement,
  createContext,
  h as createElement,
  isValidElement,
  startTransition,
  startTransition as unstable_startTransition,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  jsx,
  jsxs,
  jsx as jsxDEV,
  memo,
  // createMutableSource,
  // createMutableSource as unstable_createMutableSource,
  // createRef,
  // createServerContext,
  // forwardRef,
  // lazy,
  // Profiler,
  // PureComponent,
  // StrictMode,
  // Suspense,
  // SuspenseList,
  // SuspenseList as unstable_SuspenseList, // TODO: Remove once call sights updated to SuspenseList
  // unstable_Cache,
  // unstable_DebugTracingMode,
  // unstable_LegacyHidden,
  // unstable_Offscreen,
  // unstable_Scope,
  // unstable_getCacheSignal,
  // unstable_getCacheForType,
  // unstable_useCacheRefresh,
  // useId,
  // useDebugValue,
  // useDeferredValue,
  // useDeferredValue as unstable_useDeferredValue, // TODO: Remove once call sights updated to useDeferredValue
  // useImperativeHandle,
  // useInsertionEffect,
  // useMutableSource,
  // useMutableSource as unstable_useMutableSource,
  // useSyncExternalStore,
  // useTransition,
  // useTransition as unstable_useTransition,
};
