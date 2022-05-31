import { render, hydrate } from '../million';
import { VNode } from '../million/types';
import { augmentor } from './hooks';

export * from './hooks';

// eslint-disable-next-line @typescript-eslint/ban-types
export const compat = (fn: Function) => augmentor(fn)();

export const createRoot = (root: HTMLElement) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const renderer = (fn: Function) => {
    return (vnode: VNode) => fn(root, vnode);
  };
  return {
    render: renderer(render),
    hydrate: renderer(hydrate),
  };
};
