const workQueue: (() => void)[] = [];
let pending = false;

export const isPending = () => pending;

export const startTransition = (work: () => void): void => {
  workQueue.push(work);
  if (!pending) requestIdleCallback(flushQueue);
};

export const flushQueue = (
  deadline: IdleDeadline = {
    didTimeout: false,
    timeRemaining: () => Number.MAX_VALUE,
  },
): void => {
  pending = true;
  while (
    !(navigator as any)?.scheduling?.isInputPending({ includeContinuous: true }) &&
    deadline.timeRemaining() > 0 &&
    workQueue.length > 0
  ) {
    const work = workQueue.shift();
    if (work) work();
  }
  if (workQueue.length > 0) requestIdleCallback(flushQueue);
  else pending = false;
};
