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

export {
  Fragment,
  // Profiler,
  // PureComponent,
  // StrictMode,
  // Suspense,
  // SuspenseList,
  // SuspenseList as unstable_SuspenseList, // TODO: Remove once call sights updated to SuspenseList
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
  // memo,
  startTransition,
  startTransition as unstable_startTransition,
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
  // useDeferredValue as unstable_useDeferredValue, // TODO: Remove once call sights updated to useDeferredValue
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
