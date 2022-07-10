import { useState, useEffect, useRef } from 'react';
import Wrapper from './Wrapper';

export default function Counter() {
  const [seconds, setSeconds] = useState(0);

  useInterval(() => {
    setSeconds(seconds + 1);
  }, 1000);

  return (
    <Wrapper>
      <p>Time Elapsed: {seconds}</p>
    </Wrapper>
  );
}

function useInterval(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    let id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}
