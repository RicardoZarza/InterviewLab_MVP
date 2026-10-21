import { Lock, X } from 'lucide-react';

export default function EditorTabs({ files, tabs, activePath, modifiedPaths, onSelect, onClose }) {
  return (
    <div
      role="tablist"
      aria-label="Archivos abiertos"
      className="flex h-10 shrink-0 overflow-x-auto border-b border-ink-700 bg-ink-900"
    >
      {tabs.map((path) => {
        const isActive = path === activePath;
        const name = path.split('/').pop();

        return (
          <div
            key={path}
            className={`relative flex shrink-0 items-center border-r border-ink-700 ${
              isActive ? 'bg-ink-950 text-chalk' : 'text-mist hover:bg-ink-800'
            }`}
          >
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              title={path}
              onClick={() => onSelect(path)}
              className="flex h-full items-center gap-2 pl-3 pr-2 text-sm"
            >
              {name}
              {files[path]?.readOnly && <Lock className="h-3 w-3" aria-label="Solo lectura" />}
              {modifiedPaths.has(path) && (
                <span className="h-1.5 w-1.5 rounded-full bg-hazard" role="img" aria-label="Con cambios" />
              )}
            </button>
            <button
              type="button"
              aria-label={`Cerrar ${name}`}
              onClick={() => onClose(path)}
              className="mr-1.5 rounded p-1 text-mist hover:bg-ink-700 hover:text-chalk"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            {isActive && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-hazard" />}
          </div>
        );
      })}
    </div>
  );
}
