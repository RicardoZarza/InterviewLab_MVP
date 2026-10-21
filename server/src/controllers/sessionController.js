import { getChallenge, toPublicChallenge } from '../data/challenges.js';
import { buildReport } from '../services/reportBuilder.js';
import { runChallenge } from '../services/codeRunner.js';
import { createSession, getSession } from '../services/sessionStore.js';

const MAX_FILES = 50;
const MAX_FILE_LENGTH = 200_000;

function sendError(response, status, message, code, details = []) {
  return response.status(status).json({ error: { message, code, details } });
}

function validateFiles(files) {
  if (!files || typeof files !== 'object' || Array.isArray(files)) return 'Los archivos deben ser un objeto.';
  const paths = Object.keys(files);
  if (paths.length > MAX_FILES) return 'Se superó el número máximo de archivos.';
  if (paths.some((path) => typeof files[path] !== 'string' || files[path].length > MAX_FILE_LENGTH)) {
    return 'Cada archivo debe contener texto y no superar el tamaño permitido.';
  }
  return null;
}

function validElapsedMs(value) {
  return Number.isFinite(value) && value >= 0;
}

function getActiveRecord(request, response) {
  const record = getSession(request.params.id);
  if (!record) {
    sendError(response, 404, 'La sesión no existe.', 'NOT_FOUND');
    return null;
  }
  if (record.report) {
    sendError(response, 409, 'La sesión ya ha finalizado.', 'SESSION_FINISHED');
    return null;
  }
  return record;
}

export function startSession(request, response) {
  const { candidateName, challengeId } = request.body ?? {};
  if (typeof candidateName !== 'string' || !candidateName.trim()) {
    return sendError(response, 400, 'El nombre es obligatorio', 'VALIDATION_ERROR');
  }
  if (candidateName.trim().length > 100) {
    return sendError(response, 400, 'El nombre no puede superar 100 caracteres.', 'VALIDATION_ERROR');
  }

  const challenge = getChallenge(challengeId);
  if (!challenge) return sendError(response, 404, 'El reto no existe.', 'NOT_FOUND');

  const record = createSession(candidateName.trim(), challenge.id);
  response.status(201).json({ session: record.session, challenge: toPublicChallenge(challenge) });
}

export function createRun(request, response) {
  const record = getActiveRecord(request, response);
  if (!record) return;

  const { files, elapsedMs } = request.body ?? {};
  const fileError = validateFiles(files);
  if (fileError) return sendError(response, 400, fileError, 'VALIDATION_ERROR');
  if (!validElapsedMs(elapsedMs)) {
    return sendError(response, 400, 'elapsedMs debe ser un número no negativo.', 'VALIDATION_ERROR');
  }

  const challenge = getChallenge(record.session.challengeId);
  if (challenge.files.some((file) => typeof files[file.path] !== 'string')) {
    return sendError(response, 400, 'Falta uno o más archivos requeridos por el reto.', 'VALIDATION_ERROR');
  }

  const result = runChallenge(challenge, files);
  const run = {
    id: crypto.randomUUID(),
    attempt: record.runs.length + 1,
    ...result,
    createdAt: new Date().toISOString(),
  };
  record.runs.push({ ...run, elapsedMs: Math.round(elapsedMs) });
  response.json({ run });
}

export function createEvents(request, response) {
  const record = getActiveRecord(request, response);
  if (!record) return;

  const { events } = request.body ?? {};
  if (!Array.isArray(events) || events.length > 500) {
    return sendError(response, 400, 'events debe ser una lista de hasta 500 eventos.', 'VALIDATION_ERROR');
  }
  if (events.some((event) =>
    !event || typeof event.type !== 'string' ||
    typeof event.ts !== 'string' || Number.isNaN(Date.parse(event.ts)) ||
    !validElapsedMs(event.elapsedMs) || !event.payload || typeof event.payload !== 'object' ||
    Array.isArray(event.payload)
  )) {
    return sendError(response, 400, 'Cada evento debe cumplir el formato requerido.', 'VALIDATION_ERROR');
  }

  record.events.push(...events);
  response.status(204).end();
}

export function finishSession(request, response) {
  const record = getActiveRecord(request, response);
  if (!record) return;

  const { files, elapsedMs } = request.body ?? {};
  const fileError = validateFiles(files);
  if (fileError) return sendError(response, 400, fileError, 'VALIDATION_ERROR');
  if (!validElapsedMs(elapsedMs)) {
    return sendError(response, 400, 'elapsedMs debe ser un número no negativo.', 'VALIDATION_ERROR');
  }

  const challenge = getChallenge(record.session.challengeId);
  if (challenge.files.some((file) => typeof files[file.path] !== 'string')) {
    return sendError(response, 400, 'Falta uno o más archivos requeridos por el reto.', 'VALIDATION_ERROR');
  }

  const finalRun = runChallenge(challenge, files);
  record.report = buildReport(record, challenge, files, elapsedMs, finalRun);
  response.json({ report: record.report });
}

export function getSessionReport(request, response) {
  const record = getSession(request.params.id);
  if (!record) return sendError(response, 404, 'La sesión no existe.', 'NOT_FOUND');
  if (!record.report) return sendError(response, 409, 'El reporte todavía no está disponible.', 'REPORT_NOT_READY');
  response.json({ report: record.report });
}