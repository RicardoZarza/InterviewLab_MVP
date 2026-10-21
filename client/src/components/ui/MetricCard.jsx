const TONES = {
  default: 'text-chalk',
  good: 'text-go',
  warn: 'text-hazard',
  bad: 'text-stop',
};

export default function MetricCard({ icon: Icon, label, value, hint, tone = 'default' }) {
  return (
    <div className="rounded-md border border-ink-700 bg-ink-800/60 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs text-mist">
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
        <span>{label}</span>
      </div>
      <div className={`mt-1 font-mono text-xl font-medium tabular-nums ${TONES[tone]}`}>{value}</div>
      {hint && <div className="mt-0.5 font-mono text-xs text-mist">{hint}</div>}
    </div>
  );
}
