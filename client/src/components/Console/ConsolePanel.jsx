import { CheckCircle2, Loader2, Terminal, XCircle } from 'lucide-react';

export default function ConsolePanel({ run, isRunning, error }) {
  const tests = run?.tests ?? [];
  const passedCount = tests.filter((test) => test.passed).length;
  const stdout = run?.stdout ?? [];

  return (
    <section aria-label="Consola" className="flex h-full min-h-0 flex-col bg-ink-900">
      <header className="flex h-9 shrink-0 items-center justify-between border-b border-ink-700 px-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Terminal className="h-4 w-4 text-mist" aria-hidden="true" />
          Consola
        </div>

        <div className="flex items-center gap-3 text-xs">
          {isRunning && (
            <span className="flex items-center gap-1.5 text-mist">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Ejecutando pruebas…
            </span>
          )}
          {run && !isRunning && (
            <span className={`font-mono tabular-nums ${run.passed ? 'text-go' : 'text-hazard'}`}>
              {passedCount}/{tests.length} tests
            </span>
          )}
        </div>
      </header>

      <div
        aria-live="polite"
        className={`min-h-0 flex-1 overflow-auto p-3 font-mono text-[13px] leading-relaxed transition-opacity ${
          isRunning ? 'opacity-60' : ''
        }`}
      >
        {error && (
          <p role="alert" className="mb-3 rounded-md border border-stop/30 bg-stop/10 px-3 py-2 text-stop">
            {error}
          </p>
        )}

        {!run && !error && (
          <p className="font-sans text-sm text-mist">
            Aún no has ejecutado el código. Pulsa Ejecutar (Ctrl + Enter) para correr las pruebas con tus cambios.
          </p>
        )}

        {run && (
          <>
            <ul className="space-y-1.5">
              {tests.map((test, index) => (
                <li key={`${index}-${test.name}`} className="flex items-start gap-2">
                  {test.passed ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-go" aria-label="Pasó" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-stop" aria-label="Falló" />
                  )}
                  <div className="min-w-0">
                    <span className={test.passed ? 'text-chalk' : 'text-stop'}>{test.name}</span>
                    {!test.passed && test.message && (
                      <p className="mt-0.5 whitespace-pre-wrap text-mist">{test.message}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {run.stderr && <pre className="mt-3 whitespace-pre-wrap text-stop">{run.stderr}</pre>}

            {stdout.length > 0 && (
              <pre className="mt-4 whitespace-pre-wrap border-t border-ink-700 pt-3 text-mist">
                {stdout.join('\n')}
              </pre>
            )}
          </>
        )}
      </div>
    </section>
  );
}
