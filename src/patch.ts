import { children } from './drivers/children';
import { node } from './drivers/node';
import { props } from './drivers/props';
import { DOMNode, VCommit, VNode, VTask } from './types/base';

const p = Promise.resolve();
let deadline = 0;

/**
 * Passes all of the tasks in a given array to a given callback function sequentially.
 * Generally, this is used to call the functions, with an optional modifier
 */
export const flush = (
  workStack: VTask[] = [],
  commit: VCommit = (task: VTask): void => task(),
): void => {
  for (let i = 0; i < workStack.length; ++i) {
    commit(workStack[i]);
  }
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
  const diff = node([children(), props()]);
  const data = diff(el, newVNode, oldVNode, workStack);
  flush(data.workStack);
  return data.el;
};

export const schedule = (task: VTask): void => {
  if (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (<any>navigator)?.scheduling?.isInputPending({ includeContinuous: true }) ||
    performance.now() >= deadline
  ) {
    p.then(task);
  } else task();
  deadline = performance.now() + 16;
};
