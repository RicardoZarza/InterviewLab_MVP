import { useCallback, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';

const THEME_NAME = 'traza-night';

const EDITOR_OPTIONS = {
  fontFamily: '"JetBrains Mono", ui-monospace, Menlo, monospace',
  fontSize: 14,
  lineHeight: 22,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  padding: { top: 12, bottom: 12 },
  smoothScrolling: true,
  renderLineHighlight: 'line',
  bracketPairColorization: { enabled: true },
};

function defineTheme(monaco) {
  monaco.editor.defineTheme(THEME_NAME, {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#080d18',
      'editor.lineHighlightBackground': '#0d1424',
      'editorLineNumber.foreground': '#46567a',
      'editorLineNumber.activeForeground': '#e6ecf8',
      'editorGutter.background': '#080d18',
      'editorCursor.foreground': '#ffb224',
      'editor.selectionBackground': '#2a3a5c99',
    },
  });
}

export default function CodeEditor({ file, onChange, onRun }) {
  // Ctrl/Cmd + Enter se registra una sola vez; la ref evita capturar un onRun obsoleto.
  const onRunRef = useRef(onRun);
  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);

  const handleMount = useCallback((editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => onRunRef.current?.());
    // Si la fuente web llega después de montar, Monaco mide mal el ancho de los caracteres.
    document.fonts?.ready.then(() => monaco.editor.remeasureFonts());
  }, []);

  if (!file) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-mist">
        Abre un archivo desde el explorador para empezar a editar.
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      path={file.path}
      language={file.language}
      value={file.content}
      theme={THEME_NAME}
      beforeMount={defineTheme}
      onMount={handleMount}
      onChange={(value) => onChange(file.path, value ?? '')}
      options={{ ...EDITOR_OPTIONS, readOnly: Boolean(file.readOnly) }}
      loading={
        <div className="flex items-center gap-2 text-sm text-mist">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Cargando editor…
        </div>
      }
    />
  );
}
