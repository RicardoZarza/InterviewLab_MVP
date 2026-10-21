import { randomUUID } from 'node:crypto';

const sessions = new Map();

export function createSession(candidateName, challengeId) {
  const session = {
    id: randomUUID(),
    candidateName,
    challengeId,
    startedAt: new Date().toISOString(),
  };
  sessions.set(session.id, { session, runs: [], events: [], report: null });
  return sessions.get(session.id);
}

export function getSession(id) {
  return sessions.get(id) ?? null;
}