import { childrenDriver } from './drivers/children';
import { mainDriver } from './drivers/main';
import { propsDriver } from './drivers/props';
import { DOMNode, VCommit, VDriver, VNode, VTask } from './types/base';

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
  (main: VDriver) =>
  (el: DOMNode, newVNode: VNode, oldVNode?: VNode, workStack: VTask[] = []): DOMNode => {
    const driver = main(el, newVNode, oldVNode, workStack);
    flushWorkStack(driver.workStack);
    return driver.el;
  };

/**
 * Diffs two VNodes and modifies the DOM node based on the necessary changes
 */
export const patch = compose(mainDriver(childrenDriver(), propsDriver()));
