import type {
  DOMNode,
  Effect,
  EffectTypes,
  Hook,
  HookTypes,
  VNode,
} from './types';

export const effect = (el: DOMNode, effects: Effect[]) => {
  return (type: EffectTypes, flush: () => void) => {
    effects.push({ el, type, flush });
  };
};

export const hook = (el: DOMNode, newVNode?: VNode, oldVNode?: VNode) => {
  return (hookName: HookTypes, vnode: VNode | undefined = newVNode) => {
    if (typeof vnode === 'object' && vnode.hook?.[hookName]) {
      if ((vnode.hook[hookName] as Hook)(el, newVNode, oldVNode)) return true;
      return false;
    }
    return true;
  };
};
