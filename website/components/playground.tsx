/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  FileTabs,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  SandpackStack,
  useActiveCode,
  useSandpack,
} from '@codesandbox/sandpack-react';
import dedent from 'dedent';
import { Editor } from '@monaco-editor/react';
import { useCallback } from 'react';
import { useDarkMode } from './use-dark-mode';

// fancy dynamic loader attached to the @monaco-editor/react's onMount callback
const activateMonacoJSXHighlighter = async (monacoEditor, monaco) => {
  // monaco-jsx-highlighter depends on these in addition to Monaco and an instance of a Monaco Editor.
  const { default: traverse } = await import('@babel/traverse');
  const { parse } = await import('@babel/parser');
  // >>> The star of the show =P >>>
  const { default: MonacoJSXHighlighter, JSXTypes } = await import(
    'monaco-jsx-highlighter' // Note: there is a polyfilled version alongside the regular version.
  ); // For example, starting with 2.0.2, 2.0.2-polyfilled is also available.

  // Instantiate the highlighter
  const monacoJSXHighlighter = new MonacoJSXHighlighter(
    monaco, // references Range and other APIs
    parse, // obtains an AST, internally passes to parse options: {...options, sourceType: "module",plugins: ["jsx"],errorRecovery: true}
    traverse, // helps collecting the JSX expressions within the AST
    monacoEditor, // highlights the content of that editor via decorations
  );
  // Start the JSX highlighting and get the dispose function
  let disposeJSXHighlighting =
    monacoJSXHighlighter.highlightOnDidChangeModelContent();
  // Enhance monaco's editor.action.commentLine with JSX commenting and get its disposer
  let disposeJSXCommenting = monacoJSXHighlighter.addJSXCommentCommand();
  // <<< You are all set. >>>

  // Optional: customize the color font in JSX texts (style class JSXElement.JSXText.tastyPizza from ./index.css)
  JSXTypes.JSXText.options.inlineClassName = 'JSXElement.JSXText.tastyPizza';
  // more details here: https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IModelDecorationOptions.html

  // This example's shorthands for toggling actions
  const toggleJSXHighlighting = () => {
    if (disposeJSXHighlighting) {
      disposeJSXHighlighting();
      disposeJSXHighlighting = null;
      return false;
    }

    disposeJSXHighlighting =
      monacoJSXHighlighter.highlightOnDidChangeModelContent();
    return true;
  };

  const toggleJSXCommenting = () => {
    if (disposeJSXCommenting) {
      disposeJSXCommenting();
      disposeJSXCommenting = null;
      return false;
    }

    disposeJSXCommenting = monacoJSXHighlighter.addJSXCommentCommand();
    return true;
  };

  const isToggleJSXHighlightingOn = () => Boolean(disposeJSXHighlighting);
  const isToggleJSXCommentingOn = () => Boolean(disposeJSXCommenting);

  return {
    monacoJSXHighlighter,
    toggleJSXHighlighting,
    toggleJSXCommenting,
    isToggleJSXHighlightingOn,
    isToggleJSXCommentingOn,
  };
};

function MonacoEditor() {
  const { code, updateCode } = useActiveCode();
  const { sandpack } = useSandpack();
  const isDarkMode = useDarkMode();
  const handleEditorDidMount = useCallback((monacoEditor, monaco) => {
    void activateMonacoJSXHighlighter(monacoEditor, monaco);
  }, []);

  return (
    <SandpackStack style={{ height: '75vh', margin: 0 }}>
      <FileTabs />
      <Editor
        width="100%"
        height="100%"
        language="javascript"
        theme={isDarkMode ? 'vs-dark' : 'light'}
        key={sandpack.activeFile}
        defaultValue={code}
        onChange={(value) => updateCode(value || '')}
        options={{ fontSize: 16 }}
        onMount={handleEditorDidMount}
      />
    </SandpackStack>
  );
}

export function Playground() {
  const isDarkMode = useDarkMode();
  return (
    <SandpackProvider
      theme={isDarkMode ? 'dark' : 'light'}
      template="vite-react"
      customSetup={{
        dependencies: {
          vite: '3.2.3',
          million: '2.3.3',
          '@vitejs/plugin-react': 'latest',
        },
      }}
      files={{
        'App.jsx': `
import { useState } from 'react';
import { block } from 'million/react';

export function App() {
  const [count, setCount] = useState(0);
  const handleClick = () => {
    setCount(count + 1);
  };

  return <button onClick={handleClick}>{count}</button>;
}

const AppBlock = block(App);

export default AppBlock;`.trim(),
        'vite.config.js': {
          code: dedent`
          import react from '@vitejs/plugin-react';
          import million from 'million/compiler';
          import { defineConfig } from 'vite';

          export default defineConfig({
            plugins: [million.vite(), react()],
          });
        `,
        },
      }}
    >
      <SandpackLayout>
        <MonacoEditor />
        <SandpackPreview style={{ height: '75vh' }} />
      </SandpackLayout>
    </SandpackProvider>
  );
}
