import { fromDomNodeToVNode } from '../../utils';
import { createElement } from '../create-element';
import { EffectTypes, Flags, HookTypes, OLD_VNODE_FIELD } from '../types';
import { effect, hook } from '../utils';
import type { Commit, DOMNode, Driver, Effect, VNode } from '../types';

/**
 * Diffs a single DOM node and modifies the DOM node based on the necessary changes
 */
export const useNode = (drivers: any[]): any => {
  const nodeDriver = (
    el: DOMNode,
    newVNode?: VNode,
    oldVNode?: VNode,
    commit: Commit = (work: () => void) => work(),
    effects: Effect[] = [],
  ): ReturnType<Driver> => {
    // resolved VNode -> stored VNode -> generated VNode
    oldVNode = oldVNode ?? el[OLD_VNODE_FIELD] ?? fromDomNodeToVNode(el);
    const queueEffect = effect(el, effects);
    const invokeHook = hook(el, newVNode, oldVNode);

    const finish = (element: DOMNode): ReturnType<Driver> => {
      return {
        el: element,
        newVNode,
        oldVNode,
        effects,
      };
    };

    if (newVNode === undefined) {
      if (!invokeHook(HookTypes.REMOVE, oldVNode)) return finish(el);
      queueEffect(EffectTypes.REMOVE, () => el.remove());
      return finish(el);
    }
    const hasString =
      typeof oldVNode === 'string' || typeof newVNode === 'string';

    if (hasString && oldVNode !== newVNode) {
      if (!invokeHook(HookTypes.UPDATE, newVNode)) return finish(el);
      const newEl = createElement(newVNode, false);
      queueEffect(EffectTypes.REPLACE, () => el.replaceWith(newEl));
      return finish(newEl);
    }
    if (
      !hasString &&
      typeof oldVNode === 'object' &&
      typeof newVNode === 'object'
    ) {
      if (!invokeHook(HookTypes.DIFF, newVNode)) return finish(el);
      if (
        newVNode.flag === Flags.ELEMENT_IGNORE ||
        oldVNode.flag === Flags.ELEMENT_IGNORE
      ) {
        return finish(el);
      }
      if (
        newVNode.flag === Flags.ELEMENT_FORCE_UPDATE ||
        oldVNode.flag === Flags.ELEMENT_FORCE_UPDATE
      ) {
        const newEl = createElement(newVNode);
        el.replaceWith(newEl);
        return finish(el);
      }

      // We handle two cases here:
      // 1. Both keys are undefined so no comparison necessary
      // 2. Keys are not the same
      if (
        (oldVNode.key === undefined && newVNode.key === undefined) ||
        oldVNode.key !== newVNode.key
      ) {
        if (oldVNode.tag !== newVNode.tag) {
          if (!invokeHook(HookTypes.UPDATE, newVNode)) return finish(el);
          const newEl = createElement(newVNode, false);
          queueEffect(EffectTypes.REPLACE, () => el.replaceWith(newEl));
          return finish(newEl);
        }

        if (newVNode.flag !== Flags.ELEMENT_SKIP_DRIVERS) {
          for (let i = 0; i < drivers.length; ++i) {
            commit(
              () => {
                (drivers[i] as Driver)(
                  el,
                  newVNode,
                  oldVNode,
                  commit,
                  effects,
                  nodeDriver,
                );
              },
              {
                el,
                newVNode,
                oldVNode,
                effects,
              },
            );
          }
        }
      }
    }

    return finish(el);
  };
  return nodeDriver;
};
