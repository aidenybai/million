'use client';

import { block } from 'million/react';
import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
    </div>
  );
}

const AppBlock = block(App);

export default AppBlock;
