import { VElement } from '.';
import { createElement } from './createElement';
import { childrenDriver } from './drivers/children';
import { propsDriver } from './drivers/props';
import { DOMNode, OLD_VNODE_FIELD, VCommit, VDriver, VNode, VTask } from './types';

/**
 * Passes all of the tasks in a given array to a given function sequentially.
 */
export const flushWorkStack = (
  workStack: VTask[],
  commit: VCommit = (task: VTask): void => task(),
): void => {
  for (let i = 0; i < workStack.length; ++i) commit(workStack[i]);
};

/**
 * Creates a custom patch function
 */
export const compose =
  (drivers: VDriver[]) =>
  (
    el: DOMNode,
    newVNode: VNode,
    prevVNode?: VNode,
    workStack: VTask[] = [],
    commit?: VCommit,
  ): DOMNode => {
    const finish = (element: DOMNode): DOMNode => {
      workStack.push(() => {
        if (!prevVNode) element[OLD_VNODE_FIELD] = newVNode;
      });
      flushWorkStack(workStack, commit);
      return element;
    };

    if (!newVNode && newVNode !== '') {
      workStack.push(() => el.remove());
      return finish(el);
    } else {
      const oldVNode: VNode | undefined = prevVNode ?? el[OLD_VNODE_FIELD];
      const hasString = typeof oldVNode === 'string' || typeof newVNode === 'string';

      if (hasString && oldVNode !== newVNode) {
        const newEl = createElement(newVNode);
        workStack.push(() => el.replaceWith(newEl));
        return finish(newEl);
      }
      if (!hasString) {
        const oldVElement = <VElement>oldVNode;
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

          if (drivers) {
            for (let i = 0; i < drivers.length; ++i) {
              drivers[i](el, newVElement, oldVElement, workStack);
            }
          }
        }
      }
    }

    return finish(el);
  };

/**
 * Diffs two VNodes and modifies the DOM node based on the necessary changes
 */
export const patch = compose([childrenDriver, propsDriver]);
