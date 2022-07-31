const workQueue: (() => void)[] = [];
let pending = false;

if (typeof window !== 'undefined') {
  // @ts-expect-error polyfill for requestIdleCallback
  window.requestIdleCallback ||= (callback: () => void) => callback();
}

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
    !(navigator as any)?.scheduling?.isInputPending({
      includeContinuous: true,
    }) &&
    deadline.timeRemaining() > 0 &&
    workQueue.length > 0
  ) {
    const work = workQueue.shift();
    if (work) work();
  }
  if (workQueue.length > 0) requestIdleCallback(flushQueue);
  else pending = false;
};

export const batch = (
  limit?: number,
): ((_callback: () => any) => (flush: boolean) => boolean) => {
  let force: number;
  let timer: number;
  let callback: () => any;
  const invoke = () => {
    reset();
    callback();
  };
  const reset = () => {
    force = limit || Infinity;
    timer = 0;
  };
  const stop = (flush: boolean) => {
    const didStop = Boolean(timer);
    if (didStop) {
      cancelAnimationFrame(timer);
      if (flush) invoke();
    }
    return didStop;
  };
  reset();
  return (_callback: () => any) => {
    callback = _callback;
    if (!timer) {
      timer = requestAnimationFrame(invoke);
    }
    if (--force < 0) stop(true);
    return stop;
  };
};
