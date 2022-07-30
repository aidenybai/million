import { createElement } from './create-element';
import { useChildren } from './drivers/use-children';
import { useNode } from './drivers/use-node';
import { useProps } from './drivers/use-props';
import { startTransition } from './scheduler';
import { DOM_REF_FIELD, EffectTypes, OLD_VNODE_FIELD } from './types';
import { effect } from './utils';
import type { DOMNode, Driver, Effect, Hook, VNode } from './types';

/**
 * Diffs two VNodes
 */
export const diff = useNode([useChildren(), useProps()]);

/**
 * Patches two VNodes and modifies the DOM node based on the necessary changes
 */
export const patch = (
  el: DOMNode,
  newVNode?: VNode,
  oldVNode?: VNode,
  hook: Hook = () => true,
  effects: Effect[] = [],
): DOMNode => {
  const queueEffect = effect(el, effects);
  const commit = (work: () => void, data: ReturnType<Driver>) => {
    if (hook(data.el, data.newVNode, data.oldVNode)) work();
  };
  const data = diff(el, newVNode, oldVNode, commit, effects);
  queueEffect(
    EffectTypes.SET_PROP,
    () => (data.el[OLD_VNODE_FIELD] = newVNode),
  );
  for (let i = 0; i < effects.length; i++) {
    effects[i]!.flush();
  }
  return data.el;
};

/**
 * Renders a VNode to the DOM
 */
export const render = (
  parentEl: DOMNode,
  newVNode?: VNode,
  oldVNode?: VNode,
  hook?: Hook,
): DOMNode => {
  const el: DOMNode | undefined = parentEl[DOM_REF_FIELD];
  if (el) {
    return patch(el, newVNode, oldVNode, hook);
  }
  const newEl = createElement(newVNode);
  parentEl.textContent = '';
  parentEl.appendChild(newEl);
  parentEl[DOM_REF_FIELD] = newEl;
  return newEl;
};

export const hydrate = (
  el: HTMLElement,
  vnode: VNode,
  intersect = true,
): void => {
  const update = () => patch(el, vnode);
  if (intersect) {
    const io = new IntersectionObserver((entries) => {
      for (let i = 0; i < entries.length; i++) {
        if (entries[i]!.isIntersecting) {
          startTransition(update);
          io.disconnect();
          break;
        }
      }
    });
    io.observe(el);
  } else {
    startTransition(update);
  }
};
