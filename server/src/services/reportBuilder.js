import { diffLines } from './lineDiff.js';

export function buildReport(sessionRecord, challenge, files, elapsedMs, finalRun, finishedAt = new Date()) {
  const runs = sessionRecord.runs;
  const tests = finalRun.tests;
  const passedTests = tests.filter((test) => test.passed).length;
  const filesChanged = challenge.files.flatMap((file) => {
    const content = files[file.path];
    if (typeof content !== 'string' || content === file.content) return [];
    const diff = diffLines(file.content, content);
    return [{ path: file.path, linesAdded: diff.added, linesRemoved: diff.removed }];
  });
  const totalLinesChanged = filesChanged.reduce(
    (total, file) => total + Math.max(file.linesAdded, file.linesRemoved),
    0,
  );
  const score = tests.length ? Math.round((passedTests / tests.length) * 100) : 0;

  return {
    sessionId: sessionRecord.session.id,
    candidateName: sessionRecord.session.candidateName,
    challengeTitle: challenge.title,
    startedAt: sessionRecord.session.startedAt,
    finishedAt: finishedAt.toISOString(),
    durationMs: Math.max(0, Math.round(elapsedMs)),
    score,
    verdict: score === 100 ? 'passed' : score > 0 ? 'partial' : 'failed',
    tests: { passed: passedTests, total: tests.length },
    attempts: runs.length,
    totalLinesChanged,
    filesChanged,
    runs: runs.map((run) => ({
      attempt: run.attempt,
      passed: run.passed,
      testsPassed: run.tests.filter((test) => test.passed).length,
      testsTotal: run.tests.length,
      elapsedMs: run.elapsedMs,
      createdAt: run.createdAt,
    })),
  };
}