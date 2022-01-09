import { createElement } from '../createElement';
import {
  Commit,
  DOMNode,
  DOMOperation,
  Driver,
  OLD_VNODE_FIELD,
  VElement,
  VNode,
} from '../types/base';

/**
 * Diffs a single DOM node and modifies the DOM node based on the necessary changes
 */
export const node = (drivers: Partial<Driver>[]) => {
  const nodeDriver = (
    el: DOMNode,
    newVNode?: VNode,
    oldVNode?: VNode,
    effects: DOMOperation[] = [],
    commit: Commit = (work: () => void) => work(),
  ): ReturnType<Driver> => {
    const finish = (element: DOMNode): ReturnType<Driver> => {
      if (!oldVNode) {
        effects.push(() => (element[OLD_VNODE_FIELD] = newVNode));
      }

      return {
        el: element,
        newVNode,
        oldVNode,
        effects,
      };
    };

    if (newVNode === undefined || newVNode === null) {
      effects.push(() => el.remove());
      return finish(el);
    } else {
      const prevVNode: VNode | undefined = oldVNode ?? el[OLD_VNODE_FIELD];
      const hasString = typeof prevVNode === 'string' || typeof newVNode === 'string';

      if (hasString && prevVNode !== newVNode) {
        const newEl = createElement(newVNode, false);
        effects.push(() => el.replaceWith(newEl));

        return finish(newEl);
      }
      if (!hasString) {
        const oldVElement = <VElement>prevVNode;
        const newVElement = <VElement>newVNode;
        if (
          (oldVElement?.key === undefined && newVElement?.key === undefined) ||
          oldVElement?.key !== newVElement?.key
        ) {
          if (oldVElement?.tag !== newVElement?.tag || el instanceof Text) {
            const newEl = createElement(newVNode, false);
            effects.push(() => el.replaceWith(newEl));
            return finish(newEl);
          }

          for (let i = 0; i < drivers.length; ++i) {
            commit(() => {
              (<Driver>drivers[i])(el, newVElement, oldVElement, effects, commit, nodeDriver);
            });
          }
        }
      }
    }

    return finish(el);
  };
  return nodeDriver;
};
