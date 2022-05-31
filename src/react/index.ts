import { render, hydrate } from '../million';
import { VNode } from '../million/types';
import { augmentor } from './hooks';

export * from './hooks';
export const createRoot = (root: HTMLElement) => {
  return {
    render(vnode: VNode) {
      augmentor(() => render(root, vnode))();
    },
    hydrate(vnode: VNode) {
      augmentor(() => hydrate(root, vnode))();
    },
  };
};
