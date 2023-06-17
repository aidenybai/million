import {
  type SandpackPredefinedTemplate,
  type SandpackFiles,
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackConsole,
} from '@codesandbox/sandpack-react';
import { useAtomValue } from 'jotai';
import { files as reactViteFiles } from '@/configurations/react-vite';
import { files as nextjsFiles } from '@/configurations/nextjs';
import { frameworkAtom } from '@/atoms/framework';
import { MonacoEditor } from './monaco-editor';
import { FrameworkSwitcher } from './framework-switcher';
import { ResizableStack } from './resizeable-stack';
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

  return (
    <div className="flex flex-col min-h-screen">
      <header style={{ height: 50 }}>header</header>
      <SandpackProvider
        theme="dark"
        template={template}
        customSetup={{ dependencies }}
        files={files}
        className="!flex !flex-col !flex-1 !h-full"
      >
        <FrameworkSwitcher />
        <SandpackLayout className="flex flex-col w-full h-full flex-1">
          <ResizableStack
            direction="horizontal"
            first={<MonacoEditor />}
            second={
              <ResizableStack
                direction="vertical"
                initialSize={0.75}
                first={<SandpackPreview showOpenInCodeSandbox={false} />}
                second={<SandpackConsole className="flex flex-1" />}
              />
            }
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
};
