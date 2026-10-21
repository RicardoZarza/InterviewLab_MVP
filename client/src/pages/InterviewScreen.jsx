import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import MetricsPanel from '@/components/Analytics/MetricsPanel';
import InstructionsPanel from '@/components/Challenge/InstructionsPanel';
import ConsolePanel from '@/components/Console/ConsolePanel';
import EditorPane from '@/components/Editor/EditorPane';
import FileExplorer from '@/components/FileExplorer/FileExplorer';
import InterviewToolbar from '@/components/Toolbar/InterviewToolbar';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useInterviewActions, useInterviewState } from '@/context/InterviewContext';
import { SessionStatus } from '@/context/interviewReducer';
import { useCodeChanges } from '@/hooks/useCodeChanges';
import { buildFileTree } from '@/utils/files';

export default function InterviewScreen() {
  const {
    status,
    session,
    challenge,
    startedAtMs,
    files,
    openTabs,
    activePath,
    editCount,
    runs,
    isRunning,
    isFinishing,
    runError,
    finishError,
  } = useInterviewState();
  const { openFile, closeTab, updateFile, runCode, finishSession } = useInterviewActions();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const tree = useMemo(() => (challenge ? buildFileTree(challenge.files) : []), [challenge]);
  const changes = useCodeChanges(files);
  const lastRun = runs.at(-1) ?? null;
  const isActive = status === SessionStatus.ACTIVE;

  // Evita perder el trabajo por recargar o cerrar la pestaña sin querer.
  useEffect(() => {
    if (!isActive) return undefined;

    const warn = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isActive]);

  if (!session || !challenge) return <Navigate to="/" replace />;
  if (status === SessionStatus.FINISHED) return <Navigate to={`/report/${session.id}`} replace />;

  const handleConfirmFinish = async () => {
    try {
      await finishSession(); // al terminar, el estado pasa a FINISHED y esta pantalla redirige al reporte
    } catch {
      // finishError ya está en el estado y se muestra dentro del diálogo
    }
  };

  return (
    <div className="flex h-full flex-col bg-ink-950">
      <InterviewToolbar
        candidateName={session.candidateName}
        startedAtMs={startedAtMs}
        running={isActive}
        isRunning={isRunning}
        onRun={runCode}
        onFinish={() => setConfirmOpen(true)}
      />

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-ink-700 bg-ink-900 md:block">
          <FileExplorer
            projectName={challenge.title}
            tree={tree}
            activePath={activePath}
            modifiedPaths={changes.modifiedPaths}
            onSelect={openFile}
          />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <EditorPane
            files={files}
            openTabs={openTabs}
            activePath={activePath}
            modifiedPaths={changes.modifiedPaths}
            onSelectTab={openFile}
            onCloseTab={closeTab}
            onChange={updateFile}
            onRun={runCode}
          />
          <div className="h-64 shrink-0 border-t border-ink-700">
            <ConsolePanel run={lastRun} isRunning={isRunning} error={runError} />
          </div>
        </main>

        <aside className="hidden w-80 shrink-0 flex-col border-l border-ink-700 bg-ink-900 lg:flex">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <InstructionsPanel challenge={challenge} />
          </div>
          <MetricsPanel
            startedAtMs={startedAtMs}
            running={isActive}
            attempts={runs.length}
            editCount={editCount}
            changes={changes}
            lastRun={lastRun}
          />
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Finalizar la prueba?"
        description="Enviaremos tu código actual y generaremos el reporte. No podrás seguir editando después."
        confirmLabel="Finalizar y ver reporte"
        cancelLabel="Seguir trabajando"
        loading={isFinishing}
        error={finishError}
        onConfirm={handleConfirmFinish}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
