/*! (c) Andrea Giammarchi - ISC */
// Copied from:
// - https://github.com/WebReflection/augmentor/blob/master/esm/index.js
// - https://github.com/WebReflection/umap/blob/master/esm/index.js

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable prefer-rest-params */
/* eslint-disable prefer-spread */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { batch, startTransition, isPending } from '../million';

let state = null;

export const umap = (_) => ({
  get: (key) => _.get(key),
  set: (key, value) => (_.set(key, value), value),
});

// main exports
export const hook = (fn) => {
  const stack = [];
  return function hook() {
    const prev = state;
    const after = [];
    state = {
      hook,
      args: arguments,
      stack,
      i: 0,
      length: stack.length,
      after,
    };
    try {
      return fn.apply(null, arguments);
    } finally {
      state = prev;
      for (let i = 0, { length } = after; i < length; i++) after[i]();
    }
  };
};

export const contextual = (fn) => {
  let check = true;
  let context = null;
  const augmented = augmentor(function () {
    return fn.apply(context, arguments);
  });
  return function hook() {
    const result = augmented.apply((context = this), arguments);
    // perform hasEffect check only once
    if (check) {
      check = !check;
      // and copy same Array if any FX was used
      if (hasEffect(augmented)) effects.set(hook, effects.get(augmented));
    }
    return result;
  };
};

// useReducer
const updates = umap(new WeakMap());
const hookdate = (hook, ctx, args) => {
  hook.apply(ctx, args);
};
const defaults = { async: false, always: false };
const getValue = (value, f) => (typeof f == 'function' ? f(value) : f);

export const useReducer = (reducer, value, init?, options?) => {
  const i = state.i++;
  const { hook, args, stack, length } = state;
  if (i === length) state.length = stack.push({});
  const ref = stack[i];
  ref.args = args;
  if (i === length) {
    const fn = typeof init === 'function';
    const { async: asy, always } = (fn ? options : init) || options || defaults;
    ref.$ = fn ? init(value) : getValue(void 0, value);
    ref._ = asy ? updates.get(hook) || updates.set(hook, batch()) : hookdate;
    ref.f = (value) => {
      const $value = reducer(ref.$, value);
      if (always || ref.$ !== $value) {
        ref.$ = $value;
        ref._(hook, null, ref.args);
      }
    };
  }
  return [ref.$, ref.f];
};

// useState
export const useState = (value, options?) => useReducer(getValue, value, void 0, options);

// useContext
const hooks = new WeakMap();
const invoke = ({ hook, args }) => {
  hook.apply(null, args);
};

export const createContext = (value) => {
  const context = { value };
  context.Provider = Provider.bind(context);
  context.Consumer = Consumer.bind(context);
  hooks.set(context, []);
  return context;
};

export const useContext = (context) => {
  const { hook, args } = state;
  const stack = hooks.get(context);
  const info = { hook, args };
  if (!stack.some(update, info)) stack.push(info);
  return context.value;
};

function Consumer({ children }) {
  return children[0](this.value);
}

function Provider({ children, value }) {
  if (this.value !== value) {
    this.value = value;
    const context = hooks.get(this);
    invoke(context[context.length - 1]);
  }
  return children;
}

function update({ hook }) {
  return hook === this.hook;
}

// dropEffect, hasEffect, useEffect, useLayoutEffect
const effects = new WeakMap();
const fx = umap(effects);
const stop = () => {};

const createEffect = (asy) => (effect, guards?) => {
  const i = state.i++;
  const { hook, after, stack, length } = state;
  if (i < length) {
    const info = stack[i];
    const { update, values, stop } = info;
    if (!guards || guards.some(different, values)) {
      info.values = guards;
      if (asy) stop(asy);
      const { clean } = info;
      if (clean) {
        info.clean = null;
        clean();
      }
      const invoke = () => {
        info.clean = effect();
      };
      if (asy) update(invoke);
      else after.push(invoke);
    }
  } else {
    const update = asy ? batch() : stop;
    const info = { clean: null, update, values: guards, stop };
    state.length = stack.push(info);
    (fx.get(hook) || fx.set(hook, [])).push(info);
    const invoke = () => {
      info.clean = effect();
    };
    if (asy) info.stop = update(invoke);
    else after.push(invoke);
  }
};

export const dropEffect = (hook) => {
  (effects.get(hook) || []).forEach((info) => {
    const { clean, stop } = info;
    stop();
    if (clean) {
      info.clean = null;
      clean();
    }
  });
};

export const hasEffect = effects.has.bind(effects);

export const useEffect = createEffect(true);

export const useLayoutEffect = createEffect(false);

// useMemo, useCallback
export const useMemo = (memo, guards?) => {
  const i = state.i++;
  const { stack, length } = state;
  if (i === length) state.length = stack.push({ $: memo(), _: guards });
  else if (!guards || guards.some(different, stack[i]._)) stack[i] = { $: memo(), _: guards };
  return stack[i].$;
};

export const useCallback = (fn, guards?) => useMemo(() => fn, guards);

// useRef
export const useRef = (value) => {
  const i = state.i++;
  const { stack, length } = state;
  if (i === length) state.length = stack.push({ current: value });
  return stack[i];
};

// useTransition
export const useTransition = () => {
  return [isPending, startTransition];
};

// useId
export const useId = () => {
  return useState(crypto.randomUUID())[0];
};

// useDebugValue
export const useDebugValue = (value: any) => {
  console.log(value);
};

// useDeferredValue
export const useDeferredValue = (value: any) => {
  return value;
};

// useSyncExternalStore
export const useSyncExternalStore = (subscribe, getSnapshot) => {
  const state = useState(getSnapshot());
  useEffect(() => {
    subscribe(state);
  });
  subscribe(state);
  return state;
};

// useImperativeHandle
export const useImperativeHandle = (ref, create) => {
  if (ref?.current) {
    const object = create();
    ref.current = { ...ref.current, ...object };
  }
};

function different(value, i) {
  return value !== this[i];
}
