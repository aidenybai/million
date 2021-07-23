import { VFiber } from './structs';

export const DEADLINE_THRESHOLD = 1000 / 60; // 60 fps in ms time

export const processWorkQueue = (workQueue: VFiber[]): void => {
  const deadline = performance.now() + DEADLINE_THRESHOLD;
  const isInputPending =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigator && (<any>navigator)?.scheduling?.isInputPending({ includeContinuous: true });

  while (workQueue.length > 0) {
    if (isInputPending || performance.now() >= deadline) {
      setTimeout(() => processWorkQueue(workQueue));
      return;
    }
    const fiber = workQueue.shift();
    if (fiber) fiber();
  }
};
