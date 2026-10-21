import { useState } from 'react';
import { ChevronDown, ChevronRight, FileCode2, FileJson, FileText, Folder, FolderOpen, Lock } from 'lucide-react';

const CODE_EXTENSIONS = new Set(['js', 'jsx', 'mjs', 'cjs', 'ts', 'tsx']);

function FileIcon({ name }) {
  const extension = name.split('.').pop()?.toLowerCase();
  const className = 'h-4 w-4 shrink-0';

  if (CODE_EXTENSIONS.has(extension)) return <FileCode2 className={`${className} text-info`} aria-hidden="true" />;
  if (extension === 'json') return <FileJson className={`${className} text-hazard`} aria-hidden="true" />;
  return <FileText className={`${className} text-mist`} aria-hidden="true" />;
}

function TreeNode({ node, depth, activePath, modifiedPaths, onSelect }) {
  const [open, setOpen] = useState(true);
  const indent = { paddingLeft: `${depth * 14 + 10}px` };

  if (node.type === 'folder') {
    return (
      <li>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          style={indent}
          className="flex w-full items-center gap-1.5 py-1 pr-3 text-left text-sm text-mist hover:bg-ink-800 hover:text-chalk"
        >
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          )}
          {open ? (
            <FolderOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <Folder className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span className="truncate">{node.name}</span>
        </button>

        {open && (
          <ul>
            {node.children.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                activePath={activePath}
                modifiedPaths={modifiedPaths}
                onSelect={onSelect}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  const isActive = node.path === activePath;

  return (
    <li>
      <button
        type="button"
        aria-current={isActive ? 'true' : undefined}
        onClick={() => onSelect(node.path)}
        style={{ paddingLeft: `${depth * 14 + 24}px` }}
        className={`flex w-full items-center gap-2 py-1 pr-3 text-left text-sm ${
          isActive ? 'bg-ink-700 text-chalk' : 'text-mist hover:bg-ink-800 hover:text-chalk'
        }`}
      >
        <FileIcon name={node.name} />
        <span className="truncate">{node.name}</span>
        <span className="ml-auto flex items-center gap-1.5">
          {node.readOnly && <Lock className="h-3 w-3" aria-label="Solo lectura" />}
          {modifiedPaths.has(node.path) && (
            <span className="h-1.5 w-1.5 rounded-full bg-hazard" role="img" aria-label="Con cambios" />
          )}
        </span>
      </button>
    </li>
  );
}

export default function FileExplorer({ projectName, tree, activePath, modifiedPaths, onSelect }) {
  return (
    <nav aria-label="Explorador de archivos" className="flex h-full min-h-0 flex-col">
      <h2 className="shrink-0 truncate border-b border-ink-700 px-3 py-2.5 text-sm font-semibold" title={projectName}>
        {projectName}
      </h2>
      <ul className="min-h-0 flex-1 overflow-y-auto py-1">
        {tree.map((node) => (
          <TreeNode
            key={node.path}
            node={node}
            depth={0}
            activePath={activePath}
            modifiedPaths={modifiedPaths}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </nav>
  );
}
