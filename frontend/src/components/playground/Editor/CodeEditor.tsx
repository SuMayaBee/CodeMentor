import { Editor } from '@monaco-editor/react';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
  onSelect?: (text: string) => void;
}

export function CodeEditor({ language, value, onChange, onSelect }: CodeEditorProps) {
  const handleEditorDidMount = (editor: any) => {
    if (!onSelect) return;

    editor.onDidChangeCursorSelection((e: any) => {
      const model = editor.getModel();
      if (!model) return;

      const selection = editor.getModel().getValueInRange(e.selection);
      if (selection && selection.trim()) {
        onSelect(selection);
      }
    });
  };

  return (
    <Editor
      height="100%"
      defaultLanguage={language}
      value={value}
      onChange={onChange}
      onMount={handleEditorDidMount}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        renderWhitespace: 'selection',
        scrollBeyondLastLine: false,
      }}
    />
  );
}

export type { CodeEditorProps };