import { useState } from 'react';

export function Demo() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`w-full ${isOpen ? 'h-[60vh]' : 'h-[30vh]'}`}>
      {isOpen ? (
        <iframe className="w-full h-full" src="https://demo.millionjs.org/">
          IFrame is not supported
        </iframe>
      ) : (
        <div className="w-full h-full flex items-center justify-center border shadow border-[#e5e7eb] dark:border-[#262626] rounded-lg">
          <button
            className="transition-colors border border-[#e5e7eb] dark:border-[#262626] text-[#262626] dark:text-[#e5e7eb] shadow py-2 px-4 rounded hover:bg-[#f3f4f6] dark:hover:bg-[#1f2937]"
            onClick={() => setIsOpen(true)}
          >
            Open Demo
          </button>
        </div>
      )}
    </div>
  );
}
