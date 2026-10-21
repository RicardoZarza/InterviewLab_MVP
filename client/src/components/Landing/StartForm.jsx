import { useState } from 'react';
import { Clock, Play } from 'lucide-react';
import Button from '@/components/ui/Button';
import DifficultyBadge from '@/components/ui/DifficultyBadge';

export default function StartForm({
  challenges,
  isLoading,
  loadError,
  onRetry,
  isSubmitting,
  submitError,
  onSubmit,
}) {
  const [name, setName] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const challengeId = selectedId ?? challenges[0]?.id ?? null;
  const canSubmit = name.trim().length >= 2 && challengeId !== null && !isSubmitting;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (canSubmit) onSubmit({ candidateName: name.trim(), challengeId });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-ink-700 bg-ink-900 p-6">
      <h2 className="text-xl font-semibold">Empieza tu prueba</h2>
      <p className="mt-1 text-sm text-mist">El cronómetro arranca cuando entras al editor.</p>

      <div className="mt-6">
        <label htmlFor="candidate-name" className="text-sm font-medium">
          Tu nombre completo
        </label>
        <input
          id="candidate-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ana Martínez"
          className="mt-2 h-11 w-full rounded-md border border-ink-600 bg-ink-950 px-3 text-sm placeholder:text-mist/60 focus:border-hazard"
        />
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium">Elige una prueba</legend>

        <div className="mt-2 space-y-2">
          {isLoading && <p className="text-sm text-mist">Cargando pruebas…</p>}

          {loadError && (
            <div role="alert" className="rounded-md border border-stop/30 bg-stop/10 p-3 text-sm">
              <p className="text-stop">{loadError}</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 font-semibold text-chalk underline-offset-4 hover:underline"
              >
                Reintentar
              </button>
            </div>
          )}

          {challenges.map((challenge) => (
            <label key={challenge.id} className="block cursor-pointer">
              <input
                type="radio"
                name="challenge"
                value={challenge.id}
                checked={challengeId === challenge.id}
                onChange={() => setSelectedId(challenge.id)}
                className="peer sr-only"
              />
              <div className="rounded-lg border border-ink-700 bg-ink-800/50 p-3 transition-colors hover:bg-ink-800 peer-checked:border-hazard peer-checked:bg-ink-800 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-hazard">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{challenge.title}</span>
                  <DifficultyBadge difficulty={challenge.difficulty} />
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-mist">{challenge.description}</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-mist">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {challenge.estimatedMinutes} min aprox.
                </p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      {submitError && (
        <p role="alert" className="mt-4 rounded-md border border-stop/30 bg-stop/10 px-3 py-2 text-sm text-stop">
          {submitError}
        </p>
      )}

      <Button type="submit" size="lg" icon={Play} loading={isSubmitting} disabled={!canSubmit} className="mt-6 w-full">
        Empezar prueba
      </Button>
    </form>
  );
}
