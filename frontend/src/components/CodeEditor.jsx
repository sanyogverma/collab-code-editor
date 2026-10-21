import { useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';

const INITIAL_CODE = `// Welcome to your collaborative workspace

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

function CodeEditor() {
  const editorRef = useRef(null);

  // Define the editor theme before Monaco creates the editor.
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

  // Save the mounted editor instance without recreating it on each render.
  const handleEditorMount = useCallback((editor) => {
    editorRef.current = editor;
    editor.focus();
  }, []);

  return (
    <Editor
      height="100%"
      width="100%"
      language="javascript"
      theme="collab-dark"
      defaultValue={INITIAL_CODE}
      beforeMount={handleBeforeMount}
      onMount={handleEditorMount}
      options={{
        automaticLayout: true,
        fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
        fontSize: 13,
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