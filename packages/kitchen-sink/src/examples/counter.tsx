import { useState } from 'react';
import { block } from 'million/react';

const Counter = /* @optimize */ block(() => {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
});

export default Counter;
