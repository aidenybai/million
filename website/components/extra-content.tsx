import { Markprompt } from 'markprompt';
import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';

const placeholders = [
  'What is a block?',
  'How do I integrate with Next.js?',
  'How do I use Million.js?',
  'What is Million.js?',
];

const getRandomPlaceholder = () => {
  return placeholders[Math.floor(Math.random() * placeholders.length)]!;
};

export function ExtraContent() {
  const [placeholder, setPlaceholder] = useState(getRandomPlaceholder);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder(getRandomPlaceholder());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="group mt-4 rounded-lg border border-transparent overflow-hidden bg-origin-border bg-gradient-to-r from-[#e39cb2] to-[#b073d9] dark:text-[#9ca3af] text-[#6b7280]">
      <div className="p-4 dark:bg-[#111111] bg-white">
        <div className="text-xs mb-2 font-bold">Ask AI about Million.js:</div>

        <input
          type="text"
          className="w-full border border-gray-200 dark:border-gray-500 rounded-lg p-2"
          placeholder={`${placeholder}`}
          onClick={() => {
            setIsOpen(true);
          }}
          readOnly
        />

        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          className="relative z-50 w-full"
        >
          <div
            className="fixed inset-0 bg-black/25 dark:bg-black/60"
            aria-hidden="true"
          />

          <div className="w-[90%] h-[90%] md:w-[50%] md:h-[70%] fixed inset-0 flex items-center justify-center p-4 m-auto">
            <Dialog.Panel className="border border-gray-100 dark:border-gray-800 w-full h-full rounded bg-white dark:bg-[#111] p-4">
              <Dialog.Title className="text-sm mb-2 font-bold">
                Ask AI about Million.js:
              </Dialog.Title>

              <Markprompt
                projectKey="wY6PcEDR3IESgu7d5C8Ev0rwfQB2SEID"
                model="gpt-4"
              />
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
