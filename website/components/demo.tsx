import { useState } from 'react';

export function Demo() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`w-full ${isOpen ? 'h-[60vh]' : ''}`}>
      {isOpen ? (
        <div className="w-full h-full flex-col flex items-center justify-center border shadow border-[#e5e7eb] dark:border-[#262626] rounded-lg">
          <button
            className="w-full transition-all text-[#262626] dark:text-[#e5e7eb] shadow py-2 px-4 rounded hover:opacity-[0.6]"
            onClick={() => setIsOpen(false)}
          >
            Close Demo ❌
          </button>
          <iframe className="w-full h-full" src="https://demo.million.dev/">
            iframe is not supported
          </iframe>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center border shadow border-[#e5e7eb] dark:border-[#262626] rounded-lg">
          <button
            className="w-full transition-all text-[#262626] dark:text-[#e5e7eb] shadow py-2 px-4 rounded hover:opacity-[0.6]"
            onClick={() => setIsOpen(true)}
          >
            Open Demo ✨
          </button>
        </div>
      )}
    </div>
  );
}
