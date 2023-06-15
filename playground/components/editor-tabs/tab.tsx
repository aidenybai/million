import { useSandpack } from '@codesandbox/sandpack-react';
import { useRef, useState } from 'react';
import { clsx } from 'clsx';
import { flushSync } from 'react-dom';
import { CloseIcon } from '../icons/close-icon';

interface TabProps {
  name: string;
  isActive: boolean;
}

const focusContentEditableInput = (element: HTMLElement) => {
  const range = document.createRange();
  const selection = window.getSelection();

  range.setStart(element, 0);
  range.setEnd(element, 0);
  selection?.removeAllRanges();

  selection?.addRange(range);
};

interface UseEditControllerOptions {
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onCompleteEdit: (name: string) => void;
}

const useEditController = ({
  onStartEdit,
  onCancelEdit,
  onCompleteEdit,
}: UseEditControllerOptions) => {
  const [canEdit, setCanEdit] = useState(false);
  const requestEditTimeout = useRef<NodeJS.Timeout>();

  const startEdit = () => {
    flushSync(() => {
      setCanEdit(true);
    });
    onStartEdit();
  };

  const requestEdit = () => {
    if (canEdit) return;

    if (!requestEditTimeout.current) {
      requestEditTimeout.current = setTimeout(() => {
        requestEditTimeout.current = undefined;
      }, 300);
      return;
    }
    startEdit();
  };

  const cancelEdit = () => {
    setCanEdit(false);
    onCancelEdit();
  };

  const completeEdit = (name: string) => {
    setCanEdit(false);
    onCompleteEdit(name);
  };

  return { canEdit, requestEdit, startEdit, cancelEdit, completeEdit };
};

export const Tab = ({ name, isActive }: TabProps) => {
  const { sandpack } = useSandpack();
  const buttonContentRef = useRef<HTMLButtonElement>(null);

  // the file name might have nested segments, we only show the last
  const lastName = name.split('/').at(-1);

  // remaining path, excluding initial slash and last segment
  const filePath = name.split('/').slice(1, -1).join('/');

  const onRename = (newLastName: string) => {
    const currentPosition = sandpack.visibleFiles.indexOf(name);
    const newFile = `${filePath}/${newLastName}`;

    sandpack.addFile(newFile, sandpack.files[name].code, false);

    const filesAfter = sandpack.visibleFiles.slice(currentPosition + 1);

    // Close all files after the current one
    filesAfter.forEach((file) => {
      sandpack.closeFile(file);
    });

    // Open the new file (creating a new tab) at the end
    sandpack.openFile(newFile);

    // Open all files after the current one
    filesAfter.forEach((file) => {
      sandpack.openFile(file);
    });

    // Focus on the renamed file
    sandpack.openFile(newFile);

    sandpack.deleteFile(name);
  };

  const { canEdit, requestEdit, startEdit, completeEdit, cancelEdit } =
    useEditController({
      onStartEdit: () => {
        if (!buttonContentRef.current) return;

        focusContentEditableInput(buttonContentRef.current);
      },
      onCancelEdit: () => {
        if (!buttonContentRef.current) return;
        buttonContentRef.current.textContent = lastName ?? '';
      },
      onCompleteEdit: (newLastName) => {
        if (!buttonContentRef.current) return;
        if (newLastName !== lastName) {
          onRename(newLastName);
        }

        buttonContentRef.current.blur();
      },
    });

  return (
    <div
      role="button"
      className={clsx(
        'flex relative items-center hover:bg-gray-900 hover:border-b-gray-300 transition-[background-color] duration-300 border-b-2 border-transparent h-10 text-white',
        {
          'border-b-white hover:border-b-white': isActive,
        },
      )}
      onClick={() => {
        if (!isActive) {
          sandpack.setActiveFile(name);
        }
      }}
    >
      {filePath && (
        <span className="text-[10px] absolute top-0 left-0 text-gray-300">
          {filePath}/
        </span>
      )}
      <span
        tabIndex={0}
        className={clsx('px-4 py-2 border-2 border-transparent rounded-sm', {
          'focus:border-blue-800 focus-visible:outline-none cursor-text':
            canEdit,
        })}
        suppressContentEditableWarning
        contentEditable={canEdit}
        ref={buttonContentRef}
        onClick={(e) => {
          e.stopPropagation();

          if (!isActive) {
            sandpack.setActiveFile(name);
            return;
          }

          if (!canEdit) {
            requestEdit();
          }
        }}
        onBlur={() => {
          cancelEdit();
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (!buttonContentRef.current) return;

          if (!canEdit) {
            switch (e.key) {
              // Start editing when hitting Enter
              case 'Enter': {
                if (!isActive) {
                  sandpack.setActiveFile(name);
                  return;
                }

                e.preventDefault();
                startEdit();
                return;
              }

              // Set file as active when hitting "Space"
              case ' ': {
                sandpack.setActiveFile(name);
                return;
              }
            }
          }

          switch (e.key) {
            // Since user was already editing, enter should submit the changes
            case 'Enter': {
              completeEdit(e.currentTarget.textContent ?? '');
              return;
            }

            // Remap "esc" to lose focus
            case 'Escape': {
              buttonContentRef.current.blur();
            }
          }
        }}
      >
        {lastName}
      </span>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          buttonContentRef.current?.blur();
          // eslint-disable-next-line no-alert
          const response = confirm(
            'Are you sure you want to delete this file?',
          );

          if (!response) return;

          sandpack.deleteFile(name);
        }}
      >
        <CloseIcon className="h-4 opacity-60" />
      </button>
    </div>
  );
};
