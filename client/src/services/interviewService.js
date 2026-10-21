import { http } from '@/services/httpClient';

// Contrato completo en docs/api-contract.md

export const listChallenges = (options) =>
  http.get('/challenges', options).then((data) => data.challenges);

export const createSession = ({ candidateName, challengeId }) =>
  http.post('/sessions', { candidateName, challengeId });

export const executeRun = (sessionId, { files, elapsedMs }) =>
  http.post(`/sessions/${sessionId}/runs`, { files, elapsedMs });

export const sendEvents = (sessionId, events) =>
  http.post(`/sessions/${sessionId}/events`, { events });

export const finishSession = (sessionId, { files, elapsedMs }) =>
  http.post(`/sessions/${sessionId}/finish`, { files, elapsedMs }).then((data) => data.report);

export const getReport = (sessionId, options) =>
  http.get(`/sessions/${sessionId}/report`, options).then((data) => data.report);
