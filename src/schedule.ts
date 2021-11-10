import { VTask } from './types/base';

const workStack: VTask[] = [];
const DEADLINE_THRESHOLD = 1000 / 60; // Minimum time to achieve 60 FPS
const resolvedPromise = Promise.resolve();
let deadline = 0;
let queued = false;

/*
 * Runs a task, unless the main thread is blocked and it defers and runs later
 */
export const schedule = (task: VTask): void => {
  workStack.push(task);
  nextTick();
};

/**
 * Returns true if the main thread is blocked, else false
 */
export const shouldYield = (): boolean =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (<any>navigator)?.scheduling?.isInputPending({ includeContinuous: true }) ||
  performance.now() >= deadline;

/**
 * Iterates through stack and runs tasks, defer to next tick if main thread is blocked
 */
export const flushWorkStack = (): void => {
  deadline = performance.now() + DEADLINE_THRESHOLD;
  while (!shouldYield()) {
    const task = workStack.shift();
    if (task) task();
    else break;
  }
  queued = false;
  if (workStack.length > 0) nextTick();
};

/**
 * Runs flush if not already queued
 */
export const nextTick = (): void => {
  if (!queued) {
    // Promise-based solution is by far the fastest solution
    // when compared with MessageChannel (decent) and setTimeout (bad)
    queueMicrotask(() => {
      resolvedPromise.then(flushWorkStack);
      queued = true;
    });
  }
};
