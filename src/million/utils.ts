import { DOMNode, Effect, EffectTypes, Hook, HookTypes, VNode } from './types';

export const effect = (el: DOMNode, effects: Effect[]) => {
  return (type: EffectTypes, flush: () => void) => {
    effects.push({ el, type: type, flush });
  };
};

export const hook = (el: DOMNode, newVNode?: VNode, oldVNode?: VNode) => {
  return (hookName: HookTypes, vnode?: VNode) => {
    if (!vnode) vnode = newVNode;
    if (typeof vnode === 'object' && vnode?.hook && vnode.hook[hookName]) {
      if ((vnode.hook[hookName] as Hook)(el, newVNode, oldVNode)) return true;
      else false;
    }
    return true;
  };
};
