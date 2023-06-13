import { useSandpack } from '@codesandbox/sandpack-react';
import { useRef } from 'react';
import clsx from 'clsx';
import type { SandpackFiles } from '@codesandbox/sandpack-react';

interface TabProps {
  name: string;
  isActive: boolean;
}

export const Tab = ({ name, isActive }: TabProps) => {
  const { sandpack } = useSandpack();

  const lastName = name.split('/').at(-1);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const onRename = (newName: string) => {
    sandpack.addFile(`/${newName}`, sandpack.files[name]?.code);
    sandpack.deleteFile(name);

    sandpack.openFile(`/${newName}`);
  };

  return (
    <button
      className={clsx(
        'pl-4 py-2 hover:bg-gray-900 hover:border-b-gray-300 transition-[background-color] duration-300 border-b-2 border-transparent h-8',
        {
          'border-b-white hover:border-b-white': isActive,
        },
      )}
      contentEditable={isActive}
      ref={buttonRef}
      onClick={() => {
        sandpack.setActiveFile(name);
      }}
      onBlur={(e) => {
        const newName = e.currentTarget.textContent || '';
        if (newName !== lastName) {
          onRename(newName);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onRename(e.currentTarget.textContent || '');
          buttonRef.current?.blur();
        }
      }}
    >
      {lastName}

      <svg
        stroke="currentColor"
        fill="none"
        className="h-4 opacity-60 inline ml-4"
        viewBox="0 0 24 24"
        onClick={(e) => {
          buttonRef.current?.blur();
          e.preventDefault();
          e.stopPropagation();
          // eslint-disable-next-line no-alert
          const response = confirm(
            'Are you sure you want to delete this file?',
          );

          if (!response) return;

          sandpack.deleteFile(name);
        }}
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        ></path>
      </svg>
    </button>
  );
};

const AUTO_FILE_REGEX = /^\/File\d+\.jsx$/;
const prefix = '/File';
const suffix = '.jsx';

const getNextFileName = (files: SandpackFiles) => {
  const names = Object.keys(files);
  const autoFiles = names.filter((name) => AUTO_FILE_REGEX.test(name));
  const autoFilesNumbers = autoFiles.map((name) => {
    const number = name.slice(prefix.length, -suffix.length);
    return Number(number);
  });
  const lastAutoFileNumber = Math.max(0, ...autoFilesNumbers);

  return `${prefix}${lastAutoFileNumber + 1}${suffix}`;
};

const AddButton = () => {
  const { sandpack } = useSandpack();

  const nextFileName = getNextFileName(sandpack.files);

  return (
    <button
      className="px-4 py-2 hover:bg-gray-900 transition-[background-color] duration-300 border-b-2 border-transparent h-8"
      onClick={() => {
        sandpack.addFile(nextFileName, '', true);
        sandpack.openFile(nextFileName);
      }}
    >
      +
    </button>
  );
};

export const FileTabs = () => {
  const { sandpack } = useSandpack();

  return (
    <div className="flex flex-wrap w-full gap-1 flex-shrink-0 bg-gray-950">
      {sandpack.visibleFiles.map((file) => (
        <Tab key={file} name={file} isActive={sandpack.activeFile === file} />
      ))}
      <AddButton />
    </div>
  );
};
