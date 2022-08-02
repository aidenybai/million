/*! (c) Andrea Giammarchi - ISC */
// Copied from:
// - https://github.com/WebReflection/augmentor/blob/master/esm/index.js
// - https://github.com/WebReflection/umap/blob/master/esm/index.js

/* eslint-disable no-console */
/* eslint-disable eqeqeq */
/* eslint-disable no-sequences */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-rest-params */
/* eslint-disable prefer-spread */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { batch, Deltas, startTransition, isPending } from '../million';
import type { DeltaTypes } from '../million';

let state = {
  args: null,
  stack: [],
  i: 0,
  length: 0,
  after: [],
  hook: () => {},
};

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

// useReducer
const updates = umap(new WeakMap());
const hookdate = (hook, ctx, args) => {
  hook.apply(ctx, args);
};
const defaults = { async: false, always: false };
const getValue = (value, f) => (typeof f == 'function' ? f(value) : f);

export const useReducer = <T>(reducer, value, init?, options?) => {
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
    ref.f = (value: T) => {
      const $value = reducer(ref.$, value);
      if (always || ref.$ !== $value) {
        ref.$ = $value;
        ref._(hook, null, ref.args);
      }
    };
  }
  return [ref.$ as T, ref.f];
};

// useState
export const useState = <T>(value?: T, options?) =>
  useReducer(getValue, value, void 0, options);

// useContext
const hooks = new WeakMap();
const invoke = ({ hook, args }) => {
  hook.apply(null, args);
};

export const createContext = (
  value,
): {
  value: any;
  Provider: ({ value }) => any;
  Consumer: () => any;
} => {
  const newContext = { value };
  newContext.Provider = ({ children, value }) => {
    if (newContext.value !== value) {
      newContext.value = value;
      const context = hooks.get(newContext);
      if (context?.length) {
        context.forEach(invoke);
      }
    }
    return children;
  };
  newContext.Consumer = ({ children }) => {
    const { hook, args } = state;
    const stack = hooks.get(newContext);
    const info = { hook, args };
    if (!stack.some(update, info)) stack.push(info);
    return children[0](newContext.value);
  };
  hooks.set(newContext, []);
  return newContext;
};

export const useContext = (context) => {
  const { hook, args } = state;
  const stack = hooks.get(context);
  const info = { hook, args };
  if (!stack.some(update, info)) {
    stack.push(info);
  }
  return context.value;
};

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
  else if (!guards || guards.some(different, stack[i]._))
    stack[i] = { $: memo(), _: guards };
  return stack[i].$;
};

export const useCallback = (fn, guards?) => useMemo(() => fn, guards);

// useRef
export const useRef = (value?): any => {
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

// useDelta
export const useDelta = () => {
  const delta: DeltaTypes[] & {
    create: ReturnType<typeof deltaFunction>;
    update: ReturnType<typeof deltaFunction>;
    delete: ReturnType<typeof deltaFunction>;
  } = [];

  const deltaFunction = (type: string) => (index: number) => {
    delta.push(Deltas[type](index));
  };

  delta.create = deltaFunction('CREATE');
  delta.update = deltaFunction('UPDATE');
  delta.delete = deltaFunction('DELETE');

  return delta;
};

// useList
export const useList = (array: any[]) => {
  let length: number = array.length;

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);
  const delta = useDelta();

  const queueRender = useMemo(() => batch(), []);
  const proxy = useMemo(() => {
    array.delta = () => {
      const ret = array._delta;
      array._delta = [];
      return ret;
    };
    array._delta = delta;
    return new Proxy(array, {
      get(target, prop, receiver) {
        if (prop === 'splice') {
          return (
            start: number,
            deleteCount: number = target.length - start,
            ...items: any[]
          ) => {
            for (let i = 0; i < deleteCount; i++) {
              target._delta.push(Deltas.REMOVE(start));
            }
            for (let i = 0; i < items.length; i++) {
              target._delta.push(Deltas.CREATE(start + i));
            }

            target.splice(start, deleteCount, ...items);
            target.length += items.length - deleteCount;

            queueRender(forceUpdate);
          };
        }
        return Reflect.get(target, prop, receiver);
      },
      set(target, prop, value, receiver) {
        Reflect.set(target, prop, value, receiver);
        if (!isNaN(prop)) {
          target._delta.push(
            target.length > length
              ? Deltas.CREATE(Number(prop))
              : Deltas.UPDATE(Number(prop)),
          );
          queueRender(forceUpdate);
        }
        length = target.length;
        return true;
      },
      deleteProperty(target, prop) {
        Reflect.deleteProperty(target, prop);
        length = target.length;
        if (!isNaN(prop)) {
          target._delta.push(Deltas.REMOVE(Number(prop)));
          queueRender(forceUpdate);
        }
        return true;
      },
    });
  }, []);

  return [proxy, proxy.delta()];
};
