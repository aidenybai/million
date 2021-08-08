import { VTask } from './structs';

const stack: VTask[] = [];
const DEADLINE_THRESHOLD = 1000 / 60; // Minimum time buffer for 60 FPS
let deadline = 0;

export const schedule = (callback: VTask): void => {
  stack.push(callback);
  postMessage();
};

const shouldYield = (): boolean =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (<any>navigator)?.scheduling?.isInputPending({ includeContinuous: true }) ||
  performance.now() >= deadline;

const flush = (): void => {
  deadline = performance.now() + DEADLINE_THRESHOLD;
  while (!shouldYield()) {
    const task = stack.shift();
    if (task) task();
    else break;
  }
  if (stack.length > 0) postMessage();
};

const { port1, port2 } = new MessageChannel();
port1.onmessage = flush;

const postMessage = (): void => port2.postMessage(null);
