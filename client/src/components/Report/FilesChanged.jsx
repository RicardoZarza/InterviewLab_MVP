import { FileCode2 } from 'lucide-react';

export default function FilesChanged({ files }) {
  if (files.length === 0) {
    return <p className="rounded-lg border border-ink-700 px-4 py-6 text-sm text-mist">No se modificó ningún archivo.</p>;
  }

  return (
    <ul className="divide-y divide-ink-700 rounded-lg border border-ink-700">
      {files.map((file) => (
        <li key={file.path} className="flex items-center gap-3 px-4 py-3">
          <FileCode2 className="h-4 w-4 shrink-0 text-info" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate font-mono text-sm" title={file.path}>
            {file.path}
          </span>
          <span className="font-mono text-xs tabular-nums">
            <span className="text-go">+{file.linesAdded}</span> <span className="text-stop">−{file.linesRemoved}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
