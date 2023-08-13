import { useState } from 'react';
import { block } from 'million/react';

const Counter = block(() => {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
});

// eslint-disable-next-line import/no-default-export
export default Counter;
