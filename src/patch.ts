import { createElement } from './createElement';
import { childrenDriver } from './drivers/children';
import { propsDriver } from './drivers/props';
import { OLD_VNODE_FIELD, VDriver, VElement, VNode, VTask } from './structs';

/**
 * Passes all of the callbacks in a given array to a given function sequentially.
 */
export const flushWorkStack = (
  workStack: VTask[],
  commit: (callback: VTask) => void = (callback: VTask): void => callback(),
): void => {
  for (let i = 0; i < workStack.length; ++i) {
    commit(workStack[i]);
  }
};

/**
 * Creates a custom patch function
 */
export const init =
  (drivers: VDriver[]) =>
  (
    el: HTMLElement | Text,
    newVNode: VNode,
    prevVNode?: VNode,
    workStack: VTask[] = [],
    commit?: (callback: VTask) => void,
  ): HTMLElement | Text => {
    const finish = () => {
      workStack.push(() => {
        if (!prevVNode) el[OLD_VNODE_FIELD] = newVNode;
      });
      flushWorkStack(workStack, commit);
    };

    if (!newVNode) {
      workStack.push(() => el.remove());
      finish();
      return el;
    } else {
      const oldVNode: VNode | undefined = prevVNode ?? el[OLD_VNODE_FIELD];
      const hasString = typeof oldVNode === 'string' || typeof newVNode === 'string';

      if (hasString && oldVNode !== newVNode) {
        const newEl = createElement(newVNode);
        workStack.push(() => el.replaceWith(newEl));
        finish();
        return newEl;
      } else if (!hasString) {
        if (
          (!(<VElement>oldVNode)?.key && !(<VElement>newVNode)?.key) ||
          (<VElement>oldVNode)?.key !== (<VElement>newVNode)?.key
        ) {
          if ((<VElement>oldVNode)?.tag !== (<VElement>newVNode)?.tag || el instanceof Text) {
            const newEl = createElement(newVNode);
            workStack.push(() => el.replaceWith(newEl));
            finish();
            return newEl;
          } else {
            for (let i = 0; i < drivers.length; i++) {
              drivers[i](el, <VElement>newVNode, <VElement | undefined>oldVNode, workStack);
            }
          }
        }
      }
    }

    finish();
    return el;
  };

/**
 * Diffs two VNodes and modifies the DOM node based on the necessary changes
 */
export const patch = init([propsDriver, childrenDriver]);
