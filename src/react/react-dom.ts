import { h } from '../jsx-runtime';
import {
  DOM_REF_FIELD,
  hydrate,
  patch,
  render as $render,
  startTransition,
} from '../million';
import { fromDomNodeToVNode } from '../utils';
import type { DOMNode, VElement, VNode } from '../million';

const hydrateRoot = (vnode: VNode, root: HTMLElement): HTMLElement => {
  hydrate(root, vnode);
  return root;
};

const createRoot = (root: DOMNode) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const renderer = (renderFn: Function, patchFn: Function) => {
    return (vnode?: VNode | VNode[] | null) => {
      if (!vnode) return;
      startTransition(() => {
        if (Array.isArray(vnode)) {
          const rootVNode = fromDomNodeToVNode(root) as VElement;
          patchFn(root, h(rootVNode.tag, rootVNode.props, ...vnode));
          requestAnimationFrame(
            () => (root[DOM_REF_FIELD] = root.firstChild as DOMNode),
          );
        } else {
          renderFn(root, vnode);
        }
      });
    };
  };

  return {
    render: renderer($render, patch),
    hydrate: renderer(hydrate, patch),
    unmount: () => {
      root.textContent = '';
      root[DOM_REF_FIELD] = undefined;
    },
  };
};

const render = (vnode: VNode | VNode[], root: DOMNode) => {
  startTransition(() => {
    if (Array.isArray(vnode)) {
      const rootVNode = fromDomNodeToVNode(root) as VElement;
      patch(root, h(rootVNode.tag, rootVNode.props, ...vnode) as VNode);
      requestAnimationFrame(
        () => (root[DOM_REF_FIELD] = root.firstChild as DOMNode),
      );
    } else {
      $render(root, vnode);
    }
  });
};

const createPortal = (children: VNode[], el: HTMLElement) => {
  const rootVNode = fromDomNodeToVNode(el) as VElement;
  patch(el, h(rootVNode.tag, rootVNode.props, ...children) as VNode);
};

// https://github.com/facebook/react/blob/main/packages/react-dom/index.modern.fb.js
export {
  render,
  createPortal,
  createRoot,
  hydrateRoot,
  startTransition as flushSync,
  // __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  // unstable_batchedUpdates,
  // unstable_createEventHandle,
  // unstable_flushControlled,
  // unstable_isNewReconciler,
  // unstable_runWithPriority,
};
