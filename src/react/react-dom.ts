import { h } from '../jsx-runtime';
import { hydrate, patch, render } from '../million';
import { startTransition } from '../million/scheduler';
import { DOM_REF_FIELD, VElement, VNode } from '../million/types';
import { fromDomNodeToVNode } from '../utils';
import { augmentor } from './hooks';

// eslint-disable-next-line @typescript-eslint/ban-types
const compat = (fn: Function) => augmentor(fn)();

const hydrateRoot = (vnode: VNode, root: HTMLElement): HTMLElement => {
  hydrate(root, vnode);
  return root;
};

const createRoot = (root: HTMLElement) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const renderer = (renderFn: Function, patchFn: Function) => {
    return (vnode: VNode | VNode[]) => {
      if (Array.isArray(vnode)) {
        const rootVNode = fromDomNodeToVNode(root) as VElement;
        patchFn(root, h(rootVNode.tag, rootVNode.props, ...vnode));
        requestAnimationFrame(() => (root[DOM_REF_FIELD] = root.firstChild));
      } else {
        renderFn(root, vnode);
      }
    };
  };
  return {
    render: renderer(render, patch),
    hydrate: renderer(hydrate, patch),
    unmount: () => {
      root.textContent = '';
      root[DOM_REF_FIELD] = undefined;
    },
  };
};

// https://github.com/facebook/react/blob/main/packages/react-dom/index.modern.fb.js
export {
  compat,
  // __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  // createPortal,
  createRoot,
  hydrateRoot,
  startTransition as flushSync,
  // unstable_batchedUpdates,
  // unstable_createEventHandle,
  // unstable_flushControlled,
  // unstable_isNewReconciler,
  // unstable_runWithPriority, // DO NOT USE: Temporarily exposed to migrate off of Scheduler.runWithPriority.
};
