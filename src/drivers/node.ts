import { createElement } from '../createElement';
import { DOMNode, OLD_VNODE_FIELD, VDriver, VElement, VNode, VTask } from '../types/base';

/**
 * Diffs a single DOM node and modifies the DOM node based on the necessary changes
 */
export const node = (drivers: VDriver[]) => {
  const nodeDriver = (
    el: DOMNode,
    newVNode: VNode,
    oldVNode?: VNode,
    workStack: VTask[] = [],
  ): ReturnType<VDriver> => {
    const finish = (element: DOMNode): ReturnType<VDriver> => {
      workStack.push(() => {
        if (!oldVNode) element[OLD_VNODE_FIELD] = newVNode;
      });
      return {
        el: element,
        newVNode,
        oldVNode,
        workStack,
      };
    };

    if (!newVNode && newVNode !== '') {
      workStack.push(() => el.remove());
      return finish(el);
    } else {
      const prevVNode: VNode | undefined = oldVNode ?? el[OLD_VNODE_FIELD];
      const hasString = typeof prevVNode === 'string' || typeof newVNode === 'string';

      if (hasString && prevVNode !== newVNode) {
        const newEl = createElement(newVNode);
        workStack.push(() => el.replaceWith(newEl));

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
            const newEl = createElement(newVNode);
            workStack.push(() => el.replaceWith(newEl));
            return finish(newEl);
          }

          for (let i = 0; i < drivers.length; ++i) {
            drivers[i](el, newVElement, oldVElement, workStack, nodeDriver);
          }
        }
      }
    }

    return finish(el);
  };
  return nodeDriver;
};
