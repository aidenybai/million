
import { useState, useRef, useMemo, useCallback, useEffect } from "react";

interface MockProgressProps {
  timeInterval?: number;
  autoComplete?: boolean;
}

const DEFAULT_TIME_INTERVAL = 500;
const DEFAULT_AUTO_COMPLETE = true;
const PROGRESS_LOWER_LIMIT = 0;
const PROGRESS_UPPER_LIMIT = 100;
const MANUAL_PROGRESS_UPPER_LIMIT = 98;

interface MockProgressReturnType {
  progress: number;
  start: () => void;
  finish: () => void;
}

function useMockProgress(props?:MockProgressProps): MockProgressReturnType {
  const timeInterval = props?.timeInterval?? DEFAULT_TIME_INTERVAL;
  const autoComplete = props?.autoComplete ??  DEFAULT_AUTO_COMPLETE;
  
  const [progress, setProgress] = useState<number>(PROGRESS_LOWER_LIMIT); // progress value
  const increment = useRef<number>(1);  // increment for progress value update
  const shouldProgress = useRef(false); // manage start, finish progress callbacks

  // max value progress will reach automatically
  // if auto complete off,
  const upperLimit = useMemo(() => {
    return autoComplete ? PROGRESS_UPPER_LIMIT : MANUAL_PROGRESS_UPPER_LIMIT;
  }, [autoComplete]);

  // randomly increment progress in increments between 1 and 10
  const changeIncrement = useCallback(() => {
    increment.current = Math.floor(Math.random() * 10) + 1;
  }, []);

  // create interval to update progress
  const intervalRef = useInterval(() => {
    if (shouldProgress.current) {
      if (progress + increment.current <= upperLimit) {
        setProgress(progress + increment.current);
        changeIncrement();
      } else {
        setProgress(upperLimit);
        // clearInterval(intervalRef.current);
        // intervalRef.current = undefined;
      }
    }
  }, timeInterval);

  // complete progress and clear interval
  const finish = useCallback(() => {
    setProgress(PROGRESS_UPPER_LIMIT);
    shouldProgress.current = false;
    // clearInterval(intervalRef.current);
    // intervalRef.current = undefined;
  }, [intervalRef]);

  // start progress
  const start = useCallback(() => {
    // if (intervalRef.current) {
      shouldProgress.current = true;
      setProgress(PROGRESS_LOWER_LIMIT);
    // }
  }, [intervalRef]);

  return { progress, start, finish };
}

function useInterval(callback: any, delay: number) {
  const intervalRef = useRef<number>();
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
      intervalRef.current = window.setInterval(
        () => callbackRef.current(),
        delay
      );
      return () => window.clearInterval(intervalRef.current);
  }, [delay]);

  return intervalRef;
}

export { useMockProgress };
