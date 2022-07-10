import { useState } from 'react';
import Wrapper from './Wrapper';

export default function Counter({ init }) {
  const [value, setValue] = useState(init);

  return (
    <Wrapper>
      <div>Counter: {value}</div>
      <button
        className="py-1 px-3 bg-green-800 border border-green-700 rounded-md"
        onClick={() => setValue(value + 1)}
      >
        Increment
      </button>
      &nbsp;
      <button
        className="py-1 px-3 bg-red-800 border border-red-700 rounded-md"
        onClick={() => setValue(value - 1)}
      >
        Decrement
      </button>
    </Wrapper>
  );
}
