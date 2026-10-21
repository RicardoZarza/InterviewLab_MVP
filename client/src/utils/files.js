/** [{ path, content, ... }] -> { [path]: { ...file, original } } */
export function toFileMap(files) {
  return Object.fromEntries(files.map((file) => [file.path, { ...file, original: file.content }]));
}

/** Estado interno -> cuerpo que espera la API: { [path]: content } */
export function serializeFiles(fileMap) {
  return Object.fromEntries(Object.values(fileMap).map((file) => [file.path, file.content]));
}

/**
 * Convierte rutas planas ("src/utils/cart.js") en un árbol anidado.
 * Carpetas primero, después archivos, ambos por orden alfabético.
 */
export function buildFileTree(files) {
  const root = { children: [] };

  files.forEach((file) => {
    const parts = file.path.split('/');
    let cursor = root;

    parts.forEach((name, index) => {
      const isFile = index === parts.length - 1;
      const type = isFile ? 'file' : 'folder';
      let node = cursor.children.find((child) => child.name === name && child.type === type);

      if (!node) {
        node = {
          name,
          type,
          path: parts.slice(0, index + 1).join('/'),
          readOnly: isFile ? Boolean(file.readOnly) : false,
          children: [],
        };
        cursor.children.push(node);
      }
      cursor = node;
    });
  });

  const sortNodes = (node) => {
    node.children.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortNodes);
  };
  sortNodes(root);

  return root.children;
}
