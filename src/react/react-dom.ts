import { render, hydrate } from '../million';
import { VNode, DOM_REF_FIELD } from '../million/types';
import { augmentor } from './hooks';
import { startTransition } from '../million/scheduler';

// eslint-disable-next-line @typescript-eslint/ban-types
const compat = (fn: Function) => augmentor(fn)();

const hydrateRoot = (vnode: VNode, root: HTMLElement): HTMLElement => {
  hydrate(root, vnode);
  return root;
};

const createRoot = (root: HTMLElement) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const renderer = (fn: Function) => {
    return (vnode: VNode) => fn(root, vnode);
  };
  return {
    render: renderer(render),
    hydrate: renderer(hydrate),
    unmount: () => {
      root.textContent = '';
      root[DOM_REF_FIELD] = undefined;
    },
  };
};

// https://github.com/facebook/react/blob/main/packages/react-dom/index.modern.fb.js
export default {
  compat,
  // __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  // createPortal,
  createRoot,
  hydrateRoot,
  flushSync: startTransition,
  // unstable_batchedUpdates,
  // unstable_createEventHandle,
  // unstable_flushControlled,
  // unstable_isNewReconciler,
  // unstable_runWithPriority, // DO NOT USE: Temporarily exposed to migrate off of Scheduler.runWithPriority.
};
