import { createElement } from './createElement';
import { useChildren } from './drivers/useChildren';
import { useNode } from './drivers/useNode';
import { useProps } from './drivers/useProps';
import {
  Commit,
  DOMNode,
  DOMOperation,
  DOM_REF_FIELD,
  Driver,
  Hook,
  VEntity,
  VNode,
} from './types';

let deadline = 0;

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
  effects: DOMOperation[] = [],
): DOMNode => {
  const commit = (work: () => void, data: ReturnType<Driver>) => {
    if (hook(data.el, data.newVNode, data.oldVNode)) {
      work();
    }
  };
  const data = diff(el, newVNode, oldVNode, commit, effects);
  for (let i = 0; i < effects.length; i++) {
    effects[i]();
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
  const el = parentEl[DOM_REF_FIELD];
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

export const defer = Promise.resolve().then.bind(Promise.resolve());

/**
 * Split rendering work into chunks and spread it out over multiple frames
 */
export const schedule = (work: () => void): void => {
  if (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (<any>navigator)?.scheduling?.isInputPending({ includeContinuous: true }) ||
    performance.now() <= deadline
  ) {
    defer(work);
  } else work();
  // We can set a pseudo-deadline to ensure that we don't render too often
  // and depend on the calls to the function to regulate rendering
  deadline = performance.now() + 16;
};
