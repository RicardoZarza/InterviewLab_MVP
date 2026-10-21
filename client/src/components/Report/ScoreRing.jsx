export default function ScoreRing({ score, size = 132 }) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = Math.min(100, Math.max(0, Math.round(score ?? 0)));
  const offset = circumference * (1 - value / 100);

  let color = 'text-stop';
  if (value >= 80) color = 'text-go';
  else if (value >= 50) color = 'text-hazard';

  return (
    <div
      role="img"
      aria-label={`Puntuación: ${value} de 100`}
      className={`relative inline-flex shrink-0 items-center justify-center ${color}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-ink-700" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute font-mono text-3xl font-semibold tabular-nums text-chalk">{value}</span>
    </div>
  );
}
