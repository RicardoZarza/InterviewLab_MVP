import { Link, useNavigate } from 'react-router-dom';
import { Activity, Code2, FolderTree } from 'lucide-react';
import CodePreview from '@/components/Landing/CodePreview';
import StartForm from '@/components/Landing/StartForm';
import Logo from '@/components/ui/Logo';
import { useInterviewActions, useInterviewState } from '@/context/InterviewContext';
import { SessionStatus } from '@/context/interviewReducer';
import { useChallenges } from '@/hooks/useChallenges';

const FEATURES = [
  {
    icon: FolderTree,
    title: 'Un proyecto con varios archivos',
    text: 'Navega por carpetas, abre pestañas y lee el código de apoyo, como en tu editor de siempre.',
  },
  {
    icon: Code2,
    title: 'El editor de VS Code',
    text: 'Resaltado de sintaxis, autocompletado y atajos. Ejecuta con Ctrl + Enter.',
  },
  {
    icon: Activity,
    title: 'Un reporte de tu proceso',
    text: 'Guardamos tiempo, intentos y líneas cambiadas para que se vea cómo llegaste a la solución.',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { challenges, isLoading, error: loadError, retry } = useChallenges();
  const { status, error: sessionError } = useInterviewState();
  const { startSession } = useInterviewActions();

  const handleStart = async (payload) => {
    try {
      await startSession(payload);
      navigate('/interview');
    } catch {
      // El mensaje queda en el estado global y se muestra en el formulario.
    }
  };

  return (
    <div className="min-h-full">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo to="/" />
        <p className="text-sm text-mist">Evaluaciones técnicas de código</p>
      </header>

      {status === SessionStatus.ACTIVE && (
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-hazard/40 bg-hazard/10 px-4 py-3 text-sm">
            <p>Tienes una prueba en curso.</p>
            <Link to="/interview" className="font-semibold text-hazard underline-offset-4 hover:underline">
              Volver a la prueba
            </Link>
          </div>
        </div>
      )}

      <main className="mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start lg:gap-16 lg:pt-14">
        <div>
          <h1 className="max-w-xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Encuentra el bug. Corrígelo. Muéstranos cómo piensas.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-mist">
            Una entrevista técnica dentro de un editor real: abre archivos, cambia el código y ejecuta las pruebas.
            Al terminar recibes un reporte con tu tiempo, tus intentos y tus cambios.
          </p>
          <CodePreview className="mt-10 max-w-xl" />
        </div>

        <StartForm
          challenges={challenges}
          isLoading={isLoading}
          loadError={loadError}
          onRetry={retry}
          isSubmitting={status === SessionStatus.STARTING}
          submitError={sessionError}
          onSubmit={handleStart}
        />
      </main>

      <section aria-label="Qué incluye la prueba" className="border-t border-ink-700">
        <ul className="mx-auto grid max-w-6xl gap-px bg-ink-700 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="bg-ink-950 px-6 py-8">
              <Icon className="h-5 w-5 text-hazard" aria-hidden="true" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-mist">{text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
