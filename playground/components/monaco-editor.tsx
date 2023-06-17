import { Editor } from '@monaco-editor/react';
import {
  useActiveCode,
  SandpackStack,
  useSandpack,
} from '@codesandbox/sandpack-react';
import { EditorTabs } from './editor-tabs';

export const MonacoEditor = () => {
  const { code, updateCode } = useActiveCode();
  const { sandpack } = useSandpack();

  return (
    <SandpackStack className="h-full">
      <EditorTabs />
      <div style={{ background: '#1e1e1e', flex: 1 }}>
        <Editor
          width="100%"
          height="100%"
          language="javascript"
          theme="vs-light"
          key={sandpack.activeFile}
          defaultValue={code}
          onChange={(value) => updateCode(value || '')}
        />
      </div>
    </SandpackStack>
  );
};
