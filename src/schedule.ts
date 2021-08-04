import { VTask } from './structs';

const queue: VTask[] = [];
const DEADLINE_THRESHOLD = 1000 / 60; // Minimum time buffer for 60 FPS
let deadline = 0;

export const schedule = (callback: VTask, important = false): void => {
  if (important) {
    requestAnimationFrame(callback);
  } else {
    queue.push(callback);
    postMessage();
  }
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
  if (queue.length > 0) postMessage();
};

const { port1, port2 } = new MessageChannel();
port1.onmessage = flush;

export const postMessage = (): void => port2.postMessage(null);
