import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { ActionTypes, initialState, interviewReducer } from '@/context/interviewReducer';
import { createEventTracker } from '@/services/eventTracker';
import * as interviewService from '@/services/interviewService';
import { serializeFiles } from '@/utils/files';

// Dos contextos: quien solo dispara acciones (botón Ejecutar, toolbar)
// no se re-renderiza cada vez que cambia el estado (por ejemplo, al teclear).
const StateContext = createContext(null);
const ActionsContext = createContext(null);

export function InterviewProvider({ children }) {
  const [state, dispatch] = useReducer(interviewReducer, initialState);
  const stateRef = useRef(state); // lectura del estado más reciente dentro de las acciones
  const trackerRef = useRef(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => () => trackerRef.current?.stop(), []);

  // Acciones estables: se crean una sola vez y leen el estado vía ref.
  const actions = useMemo(() => {
    let runInFlight = false;

    const startSession = async ({ candidateName, challengeId }) => {
      dispatch({ type: ActionTypes.SESSION_STARTING });

      try {
        const { session, challenge } = await interviewService.createSession({
          candidateName,
          challengeId,
        });
        const startedAtMs = Date.now();

        trackerRef.current?.stop();
        const tracker = createEventTracker({ sessionId: session.id, startedAtMs });
        tracker.track('session_started', { challengeId });
        tracker.start();
        trackerRef.current = tracker;

        dispatch({ type: ActionTypes.SESSION_STARTED, payload: { session, challenge, startedAtMs } });
        return session;
      } catch (error) {
        dispatch({ type: ActionTypes.SESSION_FAILED, payload: error.message });
        throw error;
      }
    };

    const resetSession = () => {
      trackerRef.current?.stop();
      trackerRef.current = null;
      dispatch({ type: ActionTypes.SESSION_RESET });
    };

    const openFile = (path) => {
      dispatch({ type: ActionTypes.FILE_OPENED, payload: { path } });
      trackerRef.current?.track('file_opened', { path });
    };

    const closeTab = (path) => {
      dispatch({ type: ActionTypes.TAB_CLOSED, payload: { path } });
    };

    const updateFile = (path, content) => {
      dispatch({ type: ActionTypes.FILE_EDITED, payload: { path, content } });
      trackerRef.current?.trackDebounced(`edit:${path}`, 'file_edited', {
        path,
        length: content.length,
      });
    };

    const runCode = async () => {
      const { session, files, startedAtMs, runs } = stateRef.current;
      const tracker = trackerRef.current;
      if (!session || runInFlight) return;

      runInFlight = true;
      const attempt = runs.length + 1;
      const elapsedMs = Date.now() - startedAtMs;

      dispatch({ type: ActionTypes.RUN_STARTED });
      tracker?.track('run_started', { attempt });

      try {
        const { run } = await interviewService.executeRun(session.id, {
          files: serializeFiles(files),
          elapsedMs,
        });

        dispatch({
          type: ActionTypes.RUN_SUCCEEDED,
          payload: { run: { ...run, attempt: run.attempt ?? attempt, elapsedMs } },
        });
        tracker?.track('run_completed', { attempt, passed: run.passed });
        tracker?.flush();
      } catch (error) {
        dispatch({ type: ActionTypes.RUN_FAILED, payload: error.message });
        tracker?.track('run_failed', { attempt, message: error.message });
      } finally {
        runInFlight = false;
      }
    };

    const finishSession = async () => {
      const { session, files, startedAtMs } = stateRef.current;
      const tracker = trackerRef.current;
      if (!session) return null;

      const elapsedMs = Date.now() - startedAtMs;
      dispatch({ type: ActionTypes.FINISH_STARTED });
      tracker?.track('session_finished', { elapsedMs });

      try {
        await tracker?.flush();
        const report = await interviewService.finishSession(session.id, {
          files: serializeFiles(files),
          elapsedMs,
        });

        tracker?.stop();
        dispatch({ type: ActionTypes.FINISH_SUCCEEDED, payload: { report } });
        return report;
      } catch (error) {
        dispatch({ type: ActionTypes.FINISH_FAILED, payload: error.message });
        throw error;
      }
    };

    return { startSession, resetSession, openFile, closeTab, updateFile, runCode, finishSession };
  }, []);

  return (
    <ActionsContext.Provider value={actions}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </ActionsContext.Provider>
  );
}

export function useInterviewState() {
  const value = useContext(StateContext);
  if (!value) throw new Error('useInterviewState debe usarse dentro de <InterviewProvider>');
  return value;
}

export function useInterviewActions() {
  const value = useContext(ActionsContext);
  if (!value) throw new Error('useInterviewActions debe usarse dentro de <InterviewProvider>');
  return value;
}
