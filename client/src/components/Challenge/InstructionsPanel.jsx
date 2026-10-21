import { Clock } from 'lucide-react';
import DifficultyBadge from '@/components/ui/DifficultyBadge';

export default function InstructionsPanel({ challenge }) {
  return (
    <section aria-label="Instrucciones" className="p-4">
      <div className="flex items-center gap-3">
        <DifficultyBadge difficulty={challenge.difficulty} />
        <span className="flex items-center gap-1 text-xs text-mist">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {challenge.estimatedMinutes} min aprox.
        </span>
      </div>

      <h2 className="mt-3 text-lg font-semibold leading-snug">{challenge.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-mist">{challenge.description}</p>

      {challenge.instructions?.length > 0 && (
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed marker:text-mist">
          {challenge.instructions.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      )}
    </section>
  );
}
