import { createElement } from './createElement';
import { useChildren } from './drivers/useChildren';
import { useNode } from './drivers/useNode';
import { useProps } from './drivers/useProps';
import { DOMNode, DOM_REF_FIELD, Driver, Effect, Hook, VEntity, VNode } from './types';

/**
 * Diffs two VNodes
 */
export const diff = useNode([useChildren(), useProps()]);

/**
 * Patches two VNodes and modifies the DOM node based on the necessary changes
 */
export const patch = (
  el: DOMNode,
  newVNode?: VNode | VEntity,
  oldVNode?: VNode | VEntity,
  hook: Hook = () => true,
  effects: Effect[] = [],
): DOMNode => {
  const commit = (work: () => void, data: ReturnType<Driver>) => {
    startTransition(() => {
      if (hook(data.el, data.newVNode, data.oldVNode)) work();
    });
  };
  const data = diff(el, newVNode, oldVNode, commit, effects);
  for (let i = 0; i < effects.length; i++) {
    requestAnimationFrame(effects[i].flush);
  }
  return data.el;
};

/**
 * Renders a VNode to the DOM
 */
export const render = (
  parentEl: DOMNode,
  newVNode?: VNode | VEntity,
  oldVNode?: VNode | VEntity,
  hook?: Hook,
): DOMNode => {
  const el: DOMNode = parentEl[DOM_REF_FIELD];
  if (el) {
    return patch(el, newVNode, oldVNode, hook);
  } else {
    const newEl = createElement(newVNode);
    parentEl.textContent = '';
    parentEl.appendChild(newEl);
    parentEl[DOM_REF_FIELD] = newEl;
    return newEl;
  }
};

const workQueue: (() => void)[] = [];
let isFlushing = false;

export const startTransition = (work: () => void): void => {
  workQueue.push(work);
  if (!isFlushing) requestIdleCallback(flushQueue);
};

export const flushQueue = (
  deadline: IdleDeadline = {
    didTimeout: false,
    timeRemaining: () => Number.MAX_VALUE,
  },
): void => {
  isFlushing = true;
  while (
    !(<any>navigator)?.scheduling?.isInputPending({ includeContinuous: true }) &&
    deadline.timeRemaining() > 0 &&
    workQueue.length > 0
  ) {
    const work = workQueue.shift();
    if (work) work();
  }
  isFlushing = false;
  if (workQueue.length > 0) requestIdleCallback(flushQueue);
};
