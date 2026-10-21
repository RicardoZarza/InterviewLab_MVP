// Por encima de este tamaño la tabla LCS deja de ser barata; usamos una cota superior.
const MAX_LCS_CELLS = 4_000_000;

/**
 * Diff por líneas basado en la subsecuencia común más larga (LCS).
 * Devuelve cuántas líneas se añadieron y cuántas se eliminaron respecto al original.
 * Una línea editada cuenta como 1 eliminada + 1 añadida.
 */
export function diffLines(original = '', current = '') {
  if (original === current) return { added: 0, removed: 0 };

  const a = original.split('\n');
  const b = current.split('\n');

  // Recortamos prefijo y sufijo comunes: en la práctica deja una tabla diminuta.
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start += 1;

  let endA = a.length - 1;
  let endB = b.length - 1;
  while (endA >= start && endB >= start && a[endA] === b[endB]) {
    endA -= 1;
    endB -= 1;
  }

  const x = a.slice(start, endA + 1);
  const y = b.slice(start, endB + 1);

  if (x.length === 0 || y.length === 0) return { added: y.length, removed: x.length };
  if (x.length * y.length > MAX_LCS_CELLS) return { added: y.length, removed: x.length };

  let previous = new Array(y.length + 1).fill(0);
  for (let i = 1; i <= x.length; i += 1) {
    const row = new Array(y.length + 1).fill(0);
    for (let j = 1; j <= y.length; j += 1) {
      row[j] = x[i - 1] === y[j - 1] ? previous[j - 1] + 1 : Math.max(previous[j], row[j - 1]);
    }
    previous = row;
  }

  const common = previous[y.length];
  return { added: y.length - common, removed: x.length - common };
}
