import { toFileMap } from '@/utils/files';

export const SessionStatus = Object.freeze({
  IDLE: 'idle',
  STARTING: 'starting',
  ACTIVE: 'active',
  FINISHED: 'finished',
});

export const ActionTypes = Object.freeze({
  SESSION_STARTING: 'session/starting',
  SESSION_STARTED: 'session/started',
  SESSION_FAILED: 'session/failed',
  SESSION_RESET: 'session/reset',
  FILE_OPENED: 'editor/file-opened',
  TAB_CLOSED: 'editor/tab-closed',
  FILE_EDITED: 'editor/file-edited',
  RUN_STARTED: 'run/started',
  RUN_SUCCEEDED: 'run/succeeded',
  RUN_FAILED: 'run/failed',
  FINISH_STARTED: 'finish/started',
  FINISH_SUCCEEDED: 'finish/succeeded',
  FINISH_FAILED: 'finish/failed',
});

export const initialState = {
  status: SessionStatus.IDLE,
  session: null,
  challenge: null,
  startedAtMs: null, // reloj del cliente: evita desfases con el reloj del servidor
  files: {}, // { [path]: { path, language, content, original, readOnly } }
  openTabs: [],
  activePath: null,
  editCount: 0,
  runs: [],
  isRunning: false,
  isFinishing: false,
  report: null,
  error: null,
  runError: null,
  finishError: null,
};

function pickEntryFile(challenge) {
  const firstEditable = challenge.files.find((file) => !file.readOnly);
  return challenge.entryFile ?? firstEditable?.path ?? challenge.files[0]?.path ?? null;
}

/** Reducer puro: sin I/O ni relojes. Los efectos viven en InterviewContext. */
export function interviewReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SESSION_STARTING:
      return { ...initialState, status: SessionStatus.STARTING };

    case ActionTypes.SESSION_STARTED: {
      const { session, challenge, startedAtMs } = action.payload;
      const entryPath = pickEntryFile(challenge);

      return {
        ...initialState,
        status: SessionStatus.ACTIVE,
        session,
        challenge,
        startedAtMs,
        files: toFileMap(challenge.files),
        openTabs: entryPath ? [entryPath] : [],
        activePath: entryPath,
      };
    }

    case ActionTypes.SESSION_FAILED:
      return { ...initialState, error: action.payload };

    case ActionTypes.SESSION_RESET:
      return initialState;

    case ActionTypes.FILE_OPENED: {
      const { path } = action.payload;
      if (!state.files[path]) return state;

      return {
        ...state,
        activePath: path,
        openTabs: state.openTabs.includes(path) ? state.openTabs : [...state.openTabs, path],
      };
    }

    case ActionTypes.TAB_CLOSED: {
      const { path } = action.payload;
      const index = state.openTabs.indexOf(path);
      if (index === -1) return state;

      const openTabs = state.openTabs.filter((tabPath) => tabPath !== path);
      const activePath =
        state.activePath === path ? (openTabs[index] ?? openTabs[index - 1] ?? null) : state.activePath;

      return { ...state, openTabs, activePath };
    }

    case ActionTypes.FILE_EDITED: {
      const { path, content } = action.payload;
      const file = state.files[path];
      if (!file || file.readOnly || file.content === content) return state;

      return {
        ...state,
        editCount: state.editCount + 1,
        files: { ...state.files, [path]: { ...file, content } },
      };
    }

    case ActionTypes.RUN_STARTED:
      return { ...state, isRunning: true, runError: null };

    case ActionTypes.RUN_SUCCEEDED:
      return { ...state, isRunning: false, runs: [...state.runs, action.payload.run] };

    case ActionTypes.RUN_FAILED:
      return { ...state, isRunning: false, runError: action.payload };

    case ActionTypes.FINISH_STARTED:
      return { ...state, isFinishing: true, finishError: null };

    case ActionTypes.FINISH_SUCCEEDED:
      return {
        ...state,
        isFinishing: false,
        status: SessionStatus.FINISHED,
        report: action.payload.report,
      };

    case ActionTypes.FINISH_FAILED:
      return { ...state, isFinishing: false, finishError: action.payload };

    default:
      return state;
  }
}
