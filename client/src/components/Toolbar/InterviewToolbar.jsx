import { Flag, Play } from 'lucide-react';
import ElapsedTimer from '@/components/Analytics/ElapsedTimer';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';

export default function InterviewToolbar({
  candidateName,
  startedAtMs,
  running,
  isRunning,
  onRun,
  onFinish,
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-ink-700 bg-ink-900 px-4">
      <div className="flex min-w-0 items-center gap-5">
        <Logo />
        <span className="hidden truncate text-sm text-mist sm:block">{candidateName}</span>
      </div>

      <div className="flex items-center gap-4">
        <ElapsedTimer startedAtMs={startedAtMs} running={running} />
        <Button icon={Play} loading={isRunning} onClick={onRun} title="Ejecutar (Ctrl + Enter)">
          Ejecutar
        </Button>
        <Button variant="secondary" icon={Flag} onClick={onFinish}>
          Finalizar
        </Button>
      </div>
    </header>
  );
}
