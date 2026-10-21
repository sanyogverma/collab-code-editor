import { useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';

export const INITIAL_CODE = `// Welcome to your collaborative workspace

const room = {
  name: "Collaborative Workspace",
  language: "javascript",
  status: "ready",
};

function greet(name) {
  return \`Welcome, \${name}!\`;
}

console.log(greet("developer"));
`;

function CodeEditor({
  value,
  onChange,
  fontSize,
  documentPath = 'inmemory://collab-code-editor/local-preview/main.js',
}) {
  const editorRef = useRef(null);
  const disposeListenerRef = useRef(null);

  const handleBeforeMount = useCallback((monaco) => {
    monaco.editor.defineTheme('collab-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        {
          token: 'comment',
          foreground: '687B94',
          fontStyle: 'italic',
        },
        {
          token: 'keyword',
          foreground: 'C69BFF',
        },
        {
          token: 'string',
          foreground: 'B9D98A',
        },
        {
          token: 'number',
          foreground: 'E2B779',
        },
      ],
      colors: {
        'editor.background': '#0C1221',
        'editor.foreground': '#D4DCEE',
        'editorLineNumber.foreground': '#52617B',
        'editorLineNumber.activeForeground': '#9BAAC2',
        'editorCursor.foreground': '#8BB0FF',
        'editor.lineHighlightBackground': '#121B2C',
        'editor.selectionBackground': '#29446F88',
        'editor.inactiveSelectionBackground': '#202F4788',
        'editorGutter.background': '#0C1221',
        'editorIndentGuide.background1': '#263148',
        'editorIndentGuide.activeBackground1': '#536987',
      },
    });
  }, []);

  const handleEditorMount = useCallback((editor) => {
    editorRef.current = editor;

    // Clear our reference when Monaco disposes this editor instance.
    const disposeListener = editor.onDidDispose(() => {
      if (editorRef.current === editor) {
        editorRef.current = null;
      }

      if (disposeListenerRef.current === disposeListener) {
        disposeListenerRef.current = null;
      }
    });

    disposeListenerRef.current = disposeListener;
  }, []);

  return (
    <Editor
      path={documentPath}
      height="100%"
      width="100%"
      language="javascript"
      theme="collab-dark"
      value={value}
      onChange={onChange}
      beforeMount={handleBeforeMount}
      onMount={handleEditorMount}
      keepCurrentModel={false}
      saveViewState={false}
      loading={
        <div className="monaco-loading" role="status">
          Loading code editor…
        </div>
      }
      options={{
        automaticLayout: true,
        fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
        fontSize,
        lineNumbers: 'on',
        minimap: {
          enabled: false,
        },
        scrollBeyondLastLine: false,
        tabSize: 2,
        insertSpaces: true,
        wordWrap: 'off',
        padding: {
          top: 14,
          bottom: 14,
        },
        readOnly: false,
        renderLineHighlight: 'line',
        overviewRulerBorder: false,
        glyphMargin: false,
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        bracketPairColorization: {
          enabled: true,
        },
      }}
    />
  );
}

export default CodeEditor;