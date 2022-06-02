import { h, jsx, jsxs } from '../jsx-runtime';
import { VNode } from '../million/types';
import { startTransition } from '../million/scheduler';
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

export default {
  // __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  // act as unstable_act,
  // Children,
  // Component,
  // Fragment,
  // Profiler,
  // PureComponent,
  // StrictMode,
  // Suspense,
  // SuspenseList,
  // SuspenseList as unstable_SuspenseList, // TODO: Remove once call sights updated to SuspenseList
  cloneElement,
  createContext,
  createElement: h,
  // createMutableSource,
  // createMutableSource as unstable_createMutableSource,
  // createRef,
  // createServerContext,
  // forwardRef,
  isValidElement,
  // lazy,
  // memo,
  startTransition,
  unstable_startTransition: startTransition,
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
  jsxDEV: jsx,
};
