const MAX_LCS_CELLS = 4_000_000;

export function diffLines(original = '', current = '') {
  if (original === current) return { added: 0, removed: 0 };

  const originalLines = original.split('\n');
  const currentLines = current.split('\n');
  let start = 0;

  while (
    start < originalLines.length &&
    start < currentLines.length &&
    originalLines[start] === currentLines[start]
  ) {
    start += 1;
  }

  let originalEnd = originalLines.length - 1;
  let currentEnd = currentLines.length - 1;
  while (
    originalEnd >= start &&
    currentEnd >= start &&
    originalLines[originalEnd] === currentLines[currentEnd]
  ) {
    originalEnd -= 1;
    currentEnd -= 1;
  }

  const originalChanged = originalLines.slice(start, originalEnd + 1);
  const currentChanged = currentLines.slice(start, currentEnd + 1);
  if (!originalChanged.length || !currentChanged.length) {
    return { added: currentChanged.length, removed: originalChanged.length };
  }
  if (originalChanged.length * currentChanged.length > MAX_LCS_CELLS) {
    return { added: currentChanged.length, removed: originalChanged.length };
  }

  let previous = new Array(currentChanged.length + 1).fill(0);
  for (let i = 1; i <= originalChanged.length; i += 1) {
    const row = new Array(currentChanged.length + 1).fill(0);
    for (let j = 1; j <= currentChanged.length; j += 1) {
      row[j] =
        originalChanged[i - 1] === currentChanged[j - 1]
          ? previous[j - 1] + 1
          : Math.max(previous[j], row[j - 1]);
    }
    previous = row;
  }

  const commonLines = previous[currentChanged.length];
  return {
    added: currentChanged.length - commonLines,
    removed: originalChanged.length - commonLines,
  };
}