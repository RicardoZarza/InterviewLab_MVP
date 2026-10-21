import { Clock, FileDiff, Keyboard, ListChecks, PencilLine, Repeat } from 'lucide-react';
import MetricCard from '@/components/ui/MetricCard';
import { useElapsedTime } from '@/hooks/useElapsedTime';
import { formatDuration } from '@/utils/format';

export default function MetricsPanel({ startedAtMs, running, attempts, editCount, changes, lastRun }) {
  const elapsedMs = useElapsedTime(startedAtMs, running);
  const totalTests = lastRun?.tests?.length ?? 0;
  const passedTests = lastRun?.tests?.filter((test) => test.passed).length ?? 0;

  let testsTone = 'default';
  if (lastRun) testsTone = lastRun.passed ? 'good' : 'warn';

  return (
    <section aria-label="Métricas en vivo" className="border-t border-ink-700 p-4">
      <h2 className="mb-3 text-sm font-semibold">Tu progreso</h2>
      <div className="grid grid-cols-2 gap-2">
        <MetricCard icon={Clock} label="Tiempo" value={formatDuration(elapsedMs)} />
        <MetricCard icon={Repeat} label="Intentos" value={attempts} />
        <MetricCard
          icon={PencilLine}
          label="Líneas cambiadas"
          value={changes.linesChanged}
          hint={`+${changes.added} / −${changes.removed}`}
        />
        <MetricCard icon={FileDiff} label="Archivos editados" value={changes.perFile.length} />
        <MetricCard icon={Keyboard} label="Ediciones" value={editCount} />
        <MetricCard
          icon={ListChecks}
          label="Tests"
          value={lastRun ? `${passedTests}/${totalTests}` : '—'}
          tone={testsTone}
        />
      </div>
    </section>
  );
}
