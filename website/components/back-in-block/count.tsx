import { useState } from 'react';

export function CountExample() {
  const [count, setCount] = useState(0);

  const node1 = count + 1;
  const node2 = count + 2;

  return (
    <div className="border rounded border-gray-500 p-5">
      <ul className="list-disc ml-5 mb-4">
        <li>{node1}</li>
        <li>{node2}</li>
      </ul>
      <button
        className="bg-gray-500 py-1.5 px-6 rounded font-bold font-mono hover:bg-gray-600 transition-colors disabled:opacity-30"
        onClick={() => {
          setCount(count + 1);
        }}
      >
        Increment Count
      </button>
    </div>
  );
}
