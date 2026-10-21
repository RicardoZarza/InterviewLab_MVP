import CodeEditor from '@/components/Editor/CodeEditor';
import EditorTabs from '@/components/Editor/EditorTabs';

export default function EditorPane({
  files,
  openTabs,
  activePath,
  modifiedPaths,
  onSelectTab,
  onCloseTab,
  onChange,
  onRun,
}) {
  const activeFile = activePath ? files[activePath] : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <EditorTabs
        files={files}
        tabs={openTabs}
        activePath={activePath}
        modifiedPaths={modifiedPaths}
        onSelect={onSelectTab}
        onClose={onCloseTab}
      />

      {activeFile?.readOnly && (
        <p className="shrink-0 border-b border-ink-700 bg-ink-900 px-4 py-1.5 text-xs text-mist">
          Este archivo es de solo lectura. Úsalo como referencia para corregir el resto del proyecto.
        </p>
      )}

      <div className="min-h-0 flex-1 bg-ink-950">
        <CodeEditor file={activeFile} onChange={onChange} onRun={onRun} />
      </div>
    </div>
  );
}
