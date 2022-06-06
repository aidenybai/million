/* eslint-disable @typescript-eslint/ban-types */
import { Fragment, h, jsx, jsxs } from '../jsx-runtime';
import { batch, startTransition } from '../million/scheduler';
import { VNode, VProps } from '../million/types';
import { thunk } from '../million/m';
import {
  hook,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useTransition,
} from './hooks';
import { compat } from './compat';

const cloneElement = (vnode: VNode) => {
  if (typeof vnode === 'string') return vnode;
  return h(vnode.tag, vnode.props, ...(vnode.children ?? []));
};

const createElement = compat(h);

const isValidElement = (vnode: VNode) => {
  if (vnode && vnode !== null && vnode.constructor === undefined) {
    if (typeof vnode === 'string') return true;
    if (vnode.tag) return true;
  }
  return false;
};

const memo = (component: Function) => () => {
  return (props: VProps) => {
    return thunk(component as any, Object.values(props));
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

const lazy = (loader: () => Promise<Function>) => {
  let promise: Promise<Function>;

  let component: Function;
  let err: Error;
  return (props: VProps) => {
    if (!promise) {
      promise = loader();
      promise.then(
        (exports: any) => (component = exports.default || exports),
        (e) => (err = e),
      );
    }
    if (err) throw err;
    if (!component) throw promise;
    return h(component, props);
  };
};

const createRef = () => {
  return { current: null };
};

const forwardRef = (fn: Function) => {
  return function Forwarded(props: VProps) {
    const clone = { ...props };
    delete clone.ref;
    return fn(clone, props.ref || null);
  };
};

const Suspense = (props: { fallback: VNode; children: VNode[] }) => {
  return props.children;
};

const SuspenseList = (props: VProps) => {
  return props.children;
};

const StrictMode = (props: { children: VNode[] }) => {
  return props.children;
};

class Component {
  props: VProps;
  context: any;
  queueRender: (_callback: () => any) => void;
  state: VProps;
  rerender?: Function;

  constructor(props: VProps, context: any) {
    this.props = props;
    this.context = context;
    this.state = {};
    this.queueRender = batch();
  }

  componentDidMount() {
    // unsupported
    return false;
  }

  componentDidUnmount() {
    // unsupported
    return false;
  }

  componentDidUpdate() {
    // unsupported
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  shouldComponentUpdate(_newProps: VProps, _newState: VProps) {
    return true;
  }

  setState(update: VProps, callback?: (state: VProps, props: VProps) => VProps) {
    const newState = {
      ...this.state,
      ...(typeof update === 'function' ? update(this.state, this.props) : update),
    };
    if (!this.shouldComponentUpdate(this.props, newState)) return;
    if (callback) callback(this.state, this.props);
    this.state = newState;

    this.queueRender(() => {
      if (this.rerender) this.rerender();
    });
  }

  render(props?: any): any {
    return Fragment(props)!;
  }
}

class PureComponent extends Component {
  shouldComponentUpdate(newProps: VProps, newState: VProps) {
    return newProps !== this.props && newState !== this.state;
  }
}

export {
  hook,
  // __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  // act as unstable_act,
  Children,
  Component,
  Fragment,
  // Profiler,
  PureComponent,
  StrictMode,
  Suspense,
  SuspenseList,
  SuspenseList as unstable_SuspenseList,
  cloneElement,
  createContext,
  createElement,
  // createMutableSource,
  // createMutableSource as unstable_createMutableSource,
  createRef,
  // createServerContext,
  forwardRef,
  isValidElement,
  lazy,
  memo,
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
  useTransition,
  useTransition as unstable_useTransition,
  jsx,
  jsxs,
  jsx as jsxDEV,
};
