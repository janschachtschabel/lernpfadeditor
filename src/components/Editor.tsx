import React, { useRef, useEffect } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function Editor({ value, onChange, readOnly = false }: EditorProps) {
  const editorRef = useRef(null);

  useEffect(() => {
    return () => {
      if (editorRef.current) {
        (editorRef.current as any).dispose?.();
      }
    };
  }, []);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  return (
    <MonacoEditor
      height="100%"
      language="json"
      theme="vs-dark"
      value={value}
      onChange={(value) => onChange(value || '')}
      options={{
        minimap: { enabled: false },
        readOnly,
        scrollBeyondLastLine: false,
        fontSize: 14,
        wordWrap: 'on',
        automaticLayout: true,
        formatOnPaste: true,
        formatOnType: true
      }}
      onMount={handleEditorDidMount}
      loading={<div className="p-4 text-gray-500">Loading editor...</div>}
    />
  );
}