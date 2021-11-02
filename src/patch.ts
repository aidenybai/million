import { createElement } from './createElement';
import { childrenDriver } from './drivers/children';
import { propsDriver } from './drivers/props';
import { DOMNode, OLD_VNODE_FIELD, VCommit, VDriver, VElement, VNode, VTask } from './types/base';

/**
 * Passes all of the tasks in a given array to a given callback function sequentially.
 * Generally, this is used to call the functions, with an optional modifier
 */
export const flushWorkStack = (
  workStack: VTask[] = [],
  commit: VCommit = (task: VTask): void => task(),
): void => {
  for (let i = 0; i < workStack.length; ++i) commit(workStack[i]);
};

/**
 * Creates a custom patch function
 */
export const compose =
  (drivers: VDriver[] = []) =>
  (
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
            drivers[i](el, newVElement, oldVElement, workStack);
          }
        }
      }
    }

    return finish(el);
  };

/**
 * Diffs two VNodes and modifies the DOM node based on the necessary changes
 */
export const patch = (
  el: DOMNode,
  newVNode: VNode,
  oldVNode?: VNode,
  workStack: VTask[] = [],
): DOMNode => {
  const composeDriver = compose([childrenDriver(), propsDriver()]);
  const data = composeDriver(el, newVNode, oldVNode, workStack);
  flushWorkStack(data.workStack);
  return data.el;
};
