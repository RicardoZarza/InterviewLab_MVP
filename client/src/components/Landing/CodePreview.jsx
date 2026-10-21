// Maqueta decorativa: muestra el tipo de bug que el candidato encontrará.
const LINES = [
  { text: 'export function cartTotal(items, discount = 0) {' },
  { text: '  const subtotal = items.reduce(' },
  { text: '    (sum, item) => sum + item.price,', kind: 'bug' },
  { text: '    (sum, item) => sum + item.price * item.quantity,', kind: 'fix' },
  { text: '    0,' },
  { text: '  );' },
  { text: '  return subtotal * (1 - discount);' },
  { text: '}' },
];

const KIND_STYLES = {
  bug: 'bug-flag bg-stop/10 text-stop shadow-[inset_3px_0_0_theme(colors.stop)]',
  fix: 'bg-go/10 text-go shadow-[inset_3px_0_0_theme(colors.go)]',
};

export default function CodePreview({ className = '' }) {
  let lineNumber = 0;

  return (
    <figure
      aria-hidden="true"
      className={`overflow-hidden rounded-xl border border-ink-700 bg-ink-900 ${className}`}
    >
      <figcaption className="flex items-center justify-between border-b border-ink-700 px-4 py-2.5 font-mono text-xs text-mist">
        <span>src/cart.js</span>
        <span className="text-stop">2 de 4 tests fallan</span>
      </figcaption>

      <pre className="overflow-x-auto py-3 font-mono text-[13px] leading-7">
        {LINES.map(({ text, kind }, index) => {
          if (kind !== 'bug') lineNumber += 1;
          const marker = kind === 'bug' ? '−' : kind === 'fix' ? '+' : lineNumber;

          return (
            <code
              key={index}
              className={`block whitespace-pre px-4 ${kind ? KIND_STYLES[kind] : 'text-chalk/90'}`}
            >
              <span className="mr-4 inline-block w-4 text-right text-mist">{marker}</span>
              {text}
            </code>
          );
        })}
      </pre>
    </figure>
  );
}
