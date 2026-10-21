const DIFFICULTY = {
  easy: { label: 'Fácil', className: 'bg-go/10 text-go' },
  medium: { label: 'Media', className: 'bg-hazard/10 text-hazard' },
  hard: { label: 'Difícil', className: 'bg-stop/10 text-stop' },
};

export default function DifficultyBadge({ difficulty }) {
  const { label, className } = DIFFICULTY[difficulty] ?? DIFFICULTY.medium;

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
