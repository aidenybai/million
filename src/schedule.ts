// Adapted from https://github.com/yisar/fre/blob/master/src/schedule.ts

import { VTask } from './structs';

const queue: VTask[] = [];
const transitions: VTask[] = [];
const DEADLINE_THRESHOLD = 1000 / 100; // Minimum time buffer for 60 FPS (~6/16ms allocated for repaint)
let deadline = 0;

const { port1, port2 } = new MessageChannel();
port1.onmessage = () => {
  if (transitions.length > 0) transitions.shift()!();
};
export const postMessage = (): void => port2.postMessage(null);

export const schedule = (callback: VTask): void => {
  queue.push(callback);
  startTransition(flush);
};

export const startTransition = (task: VTask): void => {
  transitions.push(task) && postMessage();
};

export const shouldYield = (): boolean =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (<any>navigator)?.scheduling?.isInputPending({ includeContinuous: true }) ||
  performance.now() >= deadline;

export const flush = (): void => {
  deadline = performance.now() + DEADLINE_THRESHOLD;
  let task: VTask | undefined = queue.shift();
  while (task && !shouldYield()) {
    task();
    task = queue.shift();
  }
  if (task) startTransition(flush);
};
