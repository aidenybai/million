import Editor from '@monaco-editor/react';
import {
  useActiveCode,
  SandpackStack,
  useSandpack,
} from '@codesandbox/sandpack-react';
import { EditorTabs } from './editor-tabs';

export const MonacoEditor: React.FC<{ flex: number }> = ({ flex }) => {
  const { code, updateCode } = useActiveCode();
  const { sandpack } = useSandpack();

  return (
    <SandpackStack style={{ height: '100%', margin: 0, flex }}>
      <EditorTabs />
      <div style={{ flex: 1, background: '#1e1e1e' }}>
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
