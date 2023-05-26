'use client';
import {
  type SandpackPredefinedTemplate,
  type SandpackFiles,
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
} from '@codesandbox/sandpack-react';
import type { Frameworks } from '@/types';
import { files as reactViteFiles } from '@/configurations/react-vite';
import { files as nextjsFiles } from '@/configurations/nextjs';
import { MonacoEditor } from './monaco-editor';

type Props = {
  framework?: Frameworks;
};

const FRAMEWORK_TEMPLATE_MAP: Record<Frameworks, SandpackPredefinedTemplate> = {
  nextjs: 'nextjs',
  react: 'vite-react',
};

const FRAMEWORK_FILES_MAP: Record<Frameworks, SandpackFiles> = {
  react: reactViteFiles,
  nextjs: nextjsFiles,
};

export const Editor: React.FC<Props> = ({ framework = 'react' }) => {
  const template = FRAMEWORK_TEMPLATE_MAP[framework];
  const files = FRAMEWORK_FILES_MAP[framework];
  const dependencies = {
    million: 'latest',
  };

  return (
    <SandpackProvider
      theme="dark"
      template={template}
      customSetup={{ dependencies }}
      files={files}
    >
      <SandpackLayout>
        <MonacoEditor />
        <SandpackPreview style={{ height: '100vh' }} />
      </SandpackLayout>
    </SandpackProvider>
  );
};
