import {
  type SandpackPredefinedTemplate,
  type SandpackFiles,
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  useSandpack,
} from '@codesandbox/sandpack-react';
import { useEffect, useRef, useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  frameworkAtom,
  type Framework,
  templateAtom,
  playgroundStateAtom,
  serializeAtom,
  rwFilesAtom,
  filesAtom,
} from '@/atoms';
import { useFrameworkSyncUrl } from '@/hooks';
import { MonacoEditor } from './monaco-editor';
import { GridResizer } from './grid-resizer';
import { FrameworkSwitcher } from './framework-switcher';

export const Editor: React.FC = () => {
  useFrameworkSyncUrl();

  const template = useAtomValue(templateAtom);
  const files = useAtomValue(filesAtom);

  const resizerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [left, setLeft] = useState(0.5);

  const changeLeft = (clientX: number) => {
    if (!resizerRef.current || !gridRef.current) return;
    const resizer = resizerRef.current;
    const grid = gridRef.current;

    const rect = grid.getBoundingClientRect();

    const position = clientX - rect.left - resizer.offsetWidth / 2;
    const size = grid.offsetWidth - resizer.offsetWidth;
    const percentage = position / size;
    const percentageAdjusted = Math.min(Math.max(percentage, 0.25), 0.75);

    setLeft(percentageAdjusted);
  };

  console.log('playgroundState', files);
  return (
    <div className="flex flex-col h-100vw">
      <header style={{ height: 50 }}>header</header>
      <SandpackProvider
        theme="dark"
        template={template}
        customSetup={{
          dependencies: {
            million: 'latest',
          },
        }}
        files={files}
      >
        <Test />
        <FrameworkSwitcher />
        <SandpackLayout
          ref={gridRef}
          className="flex"
          // I want this to be dyanmic with whatever else is in the parent div but I can't figure it out
          style={{ height: 'calc(100vh - 100px)' }}
        >
          <MonacoEditor flex={left} />

          <GridResizer
            ref={resizerRef}
            isHorizontal={true}
            onResize={changeLeft}
          />

          <SandpackPreview
            style={{ height: '100%', flex: 1 - left }}
            showOpenInCodeSandbox={false}
          ></SandpackPreview>
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
};

function Test() {
  const { sandpack } = useSandpack();

  const dispatch = useSetAtom(serializeAtom);
  const framework = useAtomValue(frameworkAtom);

  const visableFiles = extract(sandpack.files, sandpack.visibleFiles);

  const saveToLocalStorage = () => {
    dispatch({
      type: 'save',
      value: { files: visableFiles, options: { framework } },
    });
  };

  const loadFromLocalStorage = () => {
    dispatch({ type: 'load' });
  };

  return (
    <div className="text-black flex flex-col">
      <button onClick={saveToLocalStorage}>save to local storage</button>
      <button onClick={loadFromLocalStorage}>load from local storage</button>
    </div>
  );
}

function extract<T>(obj: Record<string, T>, keys: string[]): Record<string, T> {
  const newObj: Record<string, T> = {};
  keys.forEach((key) => {
    if (key in obj) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
}

// function Dummy() {
//   // useFrameworkSyncSandpack();
//   const { dispatch, sandpack } = useSandpack();
//   const framework = useAtomValue(frameworkAtom);
//   console.log('status', sandpack.clients['41e6']);
//   return (
//     <button
//       onClick={() => dispatch({ type: 'shell/restart' })}
//       className="text-black"
//     >
//       restart
//     </button>
//   );
// }
