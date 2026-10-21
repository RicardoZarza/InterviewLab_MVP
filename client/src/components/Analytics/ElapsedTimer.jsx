import { Clock } from 'lucide-react';
import { useElapsedTime } from '@/hooks/useElapsedTime';
import { formatDuration } from '@/utils/format';

export default function ElapsedTimer({ startedAtMs, running }) {
  const elapsedMs = useElapsedTime(startedAtMs, running);

  return (
    <div role="timer" aria-label="Tiempo transcurrido" className="flex items-center gap-2 font-mono text-sm tabular-nums">
      <Clock className="h-4 w-4 text-mist" aria-hidden="true" />
      {formatDuration(elapsedMs)}
    </div>
  );
}
