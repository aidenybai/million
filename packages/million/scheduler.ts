const workQueue: (() => void)[] = [];
let isFlushing = false;

export const isPending = () => isFlushing;

export const startTransition = (work: () => void): void => {
  workQueue.push(work);
  if (!isFlushing) requestIdleCallback(flushQueue);
};

export const flushQueue = (
  deadline: IdleDeadline = {
    didTimeout: false,
    timeRemaining: () => Number.MAX_VALUE,
  },
): void => {
  isFlushing = true;
  while (
    !(navigator as any)?.scheduling?.isInputPending({ includeContinuous: true }) &&
    deadline.timeRemaining() > 0 &&
    workQueue.length > 0
  ) {
    const work = workQueue.shift();
    if (work) work();
  }
  if (workQueue.length > 0) requestIdleCallback(flushQueue);
  else isFlushing = false;
};
