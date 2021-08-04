import { VTask } from './structs';

const queue: VTask[] = [];
const DEADLINE_THRESHOLD = 1000 / 60; // Minimum time buffer for 60 FPS
let deadline = 0;

export const schedule = (callback: VTask): void => {
  queue.push(callback);
  setTimeout(flush);
};

export const shouldYield = (): boolean =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (<any>navigator)?.scheduling?.isInputPending({ includeContinuous: true }) ||
  performance.now() >= deadline;

export const flush = (): void => {
  deadline = performance.now() + DEADLINE_THRESHOLD;
  while (!shouldYield()) {
    const task = queue.shift();
    if (task) task();
    else break;
  }
  if (queue.length > 0) setTimeout(flush);
};
