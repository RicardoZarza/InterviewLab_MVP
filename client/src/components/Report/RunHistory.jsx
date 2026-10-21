import { CheckCircle2, XCircle } from 'lucide-react';
import { formatDuration } from '@/utils/format';

export default function RunHistory({ runs }) {
  if (runs.length === 0) {
    return <p className="rounded-lg border border-ink-700 px-4 py-6 text-sm text-mist">No ejecutaste el código durante la prueba.</p>;
  }

  return (
    <ol className="divide-y divide-ink-700 rounded-lg border border-ink-700">
      {runs.map((run) => {
        const percent = run.testsTotal ? Math.round((run.testsPassed / run.testsTotal) * 100) : 0;

        return (
          <li key={run.attempt} className="flex items-center gap-4 px-4 py-3">
            {run.passed ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-go" aria-label="Todos los tests pasaron" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 text-stop" aria-label="Hubo tests fallidos" />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span>Intento {run.attempt}</span>
                <span className="font-mono text-xs tabular-nums text-mist">a los {formatDuration(run.elapsedMs)}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-700">
                <div className={`h-full ${run.passed ? 'bg-go' : 'bg-hazard'}`} style={{ width: `${percent}%` }} />
              </div>
            </div>

            <span className="w-12 text-right font-mono text-sm tabular-nums">
              {run.testsPassed}/{run.testsTotal}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
