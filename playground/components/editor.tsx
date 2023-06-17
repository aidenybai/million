import {
  type SandpackPredefinedTemplate,
  type SandpackFiles,
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
} from '@codesandbox/sandpack-react';
import { useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { files as reactViteFiles } from '@/configurations/react-vite';
import { files as nextjsFiles } from '@/configurations/nextjs';
import { frameworkAtom } from '@/atoms/framework';
import { MonacoEditor } from './monaco-editor';
import { GridResizer } from './grid-resizer';
import { FrameworkSwitcher } from './framework-switcher';
import type { Framework } from '@/types';

const FRAMEWORK_TEMPLATE_MAP: Record<Framework, SandpackPredefinedTemplate> = {
  nextjs: 'nextjs',
  react: 'vite-react',
};

const FRAMEWORK_FILES_MAP: Record<Framework, SandpackFiles> = {
  react: reactViteFiles,
  nextjs: nextjsFiles,
};

export const Editor: React.FC = () => {
  const framework = useAtomValue<Framework>(frameworkAtom);

  const template = FRAMEWORK_TEMPLATE_MAP[framework];
  const files = FRAMEWORK_FILES_MAP[framework];
  const dependencies = {
    million: 'latest',
  };

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
  return (
    <div className="flex flex-col h-100vw">
      <header style={{ height: 50 }}>header</header>
      <SandpackProvider
        theme="dark"
        template={template}
        customSetup={{ dependencies }}
        files={files}
      >
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
