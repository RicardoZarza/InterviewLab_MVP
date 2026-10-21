# Contrato de la API (v1)

Base: `/api` (el backend escucha en el puerto `4000`; en desarrollo Vite hace proxy de `/api`).
Todas las respuestas son JSON. Las fechas son ISO 8601 en UTC.

## Formato de error

Cualquier respuesta 4xx o 5xx usa este formato. El frontend muestra `error.message` tal cual.

```json
{ "error": { "message": "El nombre es obligatorio", "code": "VALIDATION_ERROR", "details": [] } }
```

## Endpoints

| Método | Ruta | Cuerpo | Respuesta |
| --- | --- | --- | --- |
| GET | `/challenges` | n/a | `200 { challenges: ChallengeSummary[] }` |
| POST | `/sessions` | `{ candidateName, challengeId }` | `201 { session, challenge }` |
| POST | `/sessions/:id/runs` | `{ files, elapsedMs }` | `200 { run }` |
| POST | `/sessions/:id/events` | `{ events: Event[] }` | `204` |
| POST | `/sessions/:id/finish` | `{ files, elapsedMs }` | `200 { report }` |
| GET | `/sessions/:id/report` | n/a | `200 { report }` |

`files` es un objeto plano `{ [path]: contenido }` con el estado actual de todos los archivos.

## Tipos

```ts
type ChallengeSummary = {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedMinutes: number;
  description: string;
};

type Challenge = ChallengeSummary & {
  instructions: string[];            // pasos o pistas, se muestran como lista numerada
  entryFile?: string;                // archivo que se abre al empezar
  files: { path: string; language: string; content: string; readOnly?: boolean }[];
};

type Session = { id: string; candidateName: string; challengeId: string; startedAt: string };

type Run = {
  id: string;
  attempt: number;                   // 1, 2, 3...
  passed: boolean;                   // true si todos los tests pasan
  durationMs: number;
  tests: { name: string; passed: boolean; message?: string }[];
  stdout: string[];                  // líneas de salida simulada
  stderr?: string;                   // errores de sintaxis o excepciones
  createdAt: string;
};

type Event = {
  type: string;                      // session_started, file_opened, file_edited, run_started, run_completed, run_failed, session_finished
  ts: string;                        // ISO
  elapsedMs: number;                 // ms desde el inicio de la prueba
  payload: Record<string, unknown>;
};

type Report = {
  sessionId: string;
  candidateName: string;
  challengeTitle: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  score: number;                     // 0 a 100
  verdict: "passed" | "partial" | "failed";
  tests: { passed: number; total: number };
  attempts: number;
  totalLinesChanged: number;
  filesChanged: { path: string; linesAdded: number; linesRemoved: number }[];
  runs: { attempt: number; passed: boolean; testsPassed: number; testsTotal: number; elapsedMs: number; createdAt: string }[];
};
```

## Reglas de seguridad del dominio

- `GET /challenges` y `POST /sessions` **nunca** devuelven los tests ni la solución. Viven solo en el servidor.
- La métrica "líneas cambiadas" por archivo es `max(añadidas, eliminadas)` calculada con un diff de líneas (LCS). El servidor debe usar la misma definición para que el reporte coincida con lo que vio el candidato.
