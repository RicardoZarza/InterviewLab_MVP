import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, ListChecks, PencilLine, Repeat, RotateCcw } from 'lucide-react';
import FilesChanged from '@/components/Report/FilesChanged';
import RunHistory from '@/components/Report/RunHistory';
import ScoreRing from '@/components/Report/ScoreRing';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import MetricCard from '@/components/ui/MetricCard';
import { useInterviewActions, useInterviewState } from '@/context/InterviewContext';
import { getReport } from '@/services/interviewService';
import { formatDateTime, formatDuration } from '@/utils/format';

const VERDICTS = {
  passed: { label: 'Prueba superada', className: 'bg-go/10 text-go' },
  partial: { label: 'Solución parcial', className: 'bg-hazard/10 text-hazard' },
  failed: { label: 'Prueba no superada', className: 'bg-stop/10 text-stop' },
};

export default function ReportScreen() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { report: cachedReport } = useInterviewState();
  const { resetSession } = useInterviewActions();
  const [remote, setRemote] = useState({ report: null, error: null, loading: true });

  // Si venimos de finalizar la prueba, el reporte ya está en memoria; si no (recarga, enlace), se pide al servidor.
  const cached = cachedReport?.sessionId === sessionId ? cachedReport : null;

  useEffect(() => {
    if (cached) return undefined;

    const controller = new AbortController();
    setRemote({ report: null, error: null, loading: true });

    getReport(sessionId, { signal: controller.signal })
      .then((report) => setRemote({ report, error: null, loading: false }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setRemote({ report: null, error: error.message, loading: false });
      });

    return () => controller.abort();
  }, [sessionId, cached]);

  const report = cached ?? remote.report;
  const loading = !cached && remote.loading;

  const handleNewTest = () => {
    resetSession();
    navigate('/');
  };

  return (
    <div className="min-h-full">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Logo to="/" />
        <Button variant="secondary" icon={RotateCcw} onClick={handleNewTest}>
          Nueva prueba
        </Button>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20">
        {loading && <p className="py-20 text-center text-mist">Cargando reporte…</p>}

        {!loading && !report && (
          <div role="alert" className="mt-8 rounded-xl border border-stop/30 bg-stop/10 p-6">
            <h1 className="text-lg font-semibold text-stop">No pudimos cargar el reporte</h1>
            <p className="mt-2 text-sm text-mist">{remote.error ?? 'El reporte no existe o todavía no está listo.'}</p>
          </div>
        )}

        {report && <ReportContent report={report} />}
      </main>
    </div>
  );
}

function ReportContent({ report }) {
  const verdict = VERDICTS[report.verdict] ?? VERDICTS.failed;
  const tests = report.tests ?? { passed: 0, total: 0 };

  return (
    <>
      <section className="flex flex-wrap items-center justify-between gap-8 py-8">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Reporte de {report.candidateName}</h1>
          <p className="mt-2 text-mist">
            {report.challengeTitle}
            {report.finishedAt && `, finalizado el ${formatDateTime(report.finishedAt)}`}
          </p>
          <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-sm font-medium ${verdict.className}`}>
            {verdict.label}
          </span>
        </div>
        <ScoreRing score={report.score} />
      </section>

      <section aria-label="Resumen" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard icon={Clock} label="Duración" value={formatDuration(report.durationMs)} />
        <MetricCard icon={Repeat} label="Intentos" value={report.attempts ?? 0} />
        <MetricCard icon={PencilLine} label="Líneas cambiadas" value={report.totalLinesChanged ?? 0} />
        <MetricCard
          icon={ListChecks}
          label="Tests superados"
          value={`${tests.passed}/${tests.total}`}
          tone={tests.total > 0 && tests.passed === tests.total ? 'good' : 'warn'}
        />
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section aria-labelledby="runs-title">
          <h2 id="runs-title" className="mb-3 text-lg font-semibold">
            Historial de intentos
          </h2>
          <RunHistory runs={report.runs ?? []} />
        </section>

        <section aria-labelledby="files-title">
          <h2 id="files-title" className="mb-3 text-lg font-semibold">
            Archivos modificados
          </h2>
          <FilesChanged files={report.filesChanged ?? []} />
        </section>
      </div>
    </>
  );
}
