import { useMemo } from 'react';
import { diffLines } from '@/utils/diff';

/**
 * Métricas derivadas de los archivos: qué cambió respecto al original.
 * "Líneas cambiadas" por archivo = max(añadidas, eliminadas), igual que en el servidor.
 */
export function useCodeChanges(files) {
  return useMemo(() => {
    const perFile = Object.values(files)
      .filter((file) => file.content !== file.original)
      .map((file) => {
        const { added, removed } = diffLines(file.original, file.content);
        return { path: file.path, added, removed, linesChanged: Math.max(added, removed) };
      });

    const sum = (key) => perFile.reduce((total, file) => total + file[key], 0);

    return {
      perFile,
      modifiedPaths: new Set(perFile.map((file) => file.path)),
      added: sum('added'),
      removed: sum('removed'),
      linesChanged: sum('linesChanged'),
    };
  }, [files]);
}
