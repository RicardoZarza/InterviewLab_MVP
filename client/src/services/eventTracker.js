import { sendEvents } from '@/services/interviewService';

/**
 * Cola de eventos de analítica con envío por lotes.
 * - track(): registra un evento inmediato.
 * - trackDebounced(): agrupa ráfagas (por ejemplo, teclear) en un solo evento.
 * - flush(): envía lo pendiente; si falla, reencola para el siguiente intento.
 */
export function createEventTracker({ sessionId, startedAtMs, flushIntervalMs = 8000 }) {
  let queue = [];
  let intervalId = null;
  const pending = new Map();

  const buildEvent = (type, payload) => ({
    type,
    ts: new Date().toISOString(),
    elapsedMs: Date.now() - startedAtMs,
    payload,
  });

  const track = (type, payload = {}) => {
    queue.push(buildEvent(type, payload));
  };

  const trackDebounced = (key, type, payload = {}, delayMs = 1000) => {
    const event = buildEvent(type, payload);
    clearTimeout(pending.get(key)?.timeoutId);

    const commit = () => {
      pending.delete(key);
      queue.push(event);
    };
    pending.set(key, { timeoutId: setTimeout(commit, delayMs), commit });
  };

  const flush = async () => {
    pending.forEach(({ timeoutId, commit }) => {
      clearTimeout(timeoutId);
      commit();
    });

    if (queue.length === 0) return;

    const batch = queue;
    queue = [];

    try {
      await sendEvents(sessionId, batch);
    } catch {
      queue = [...batch, ...queue];
    }
  };

  const start = () => {
    if (intervalId === null) intervalId = setInterval(flush, flushIntervalMs);
  };

  const stop = () => {
    clearInterval(intervalId);
    intervalId = null;
    pending.forEach(({ timeoutId }) => clearTimeout(timeoutId));
    pending.clear();
  };

  return { track, trackDebounced, flush, start, stop };
}
