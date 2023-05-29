'use client';

import { Frameworks } from '@/types';
import { useSandpack } from '@codesandbox/sandpack-react';
import { Dispatch, SetStateAction } from 'react';

export function FrameworkSwitcher({
  setFramework,
}: {
  setFramework: Dispatch<SetStateAction<Frameworks>>;
}) {
  const { dispatch } = useSandpack();

  const handleClick = (framework: Frameworks) => {
    setFramework(framework);
    setTimeout(() => {
      dispatch({ type: 'shell/restart' });
    }, 1000);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-12">
        <div className="flex items-center justify-center">
          <button
            className="px-4 py-2 text-white bg-blue-500 rounded-md"
            onClick={() => handleClick('react')}
          >
            React
          </button>
          <button
            className="px-4 py-2 text-white bg-blue-500 rounded-md"
            onClick={() => handleClick('nextjs')}
          >
            Next.js
          </button>
        </div>
      </div>
    </>
  );
}
