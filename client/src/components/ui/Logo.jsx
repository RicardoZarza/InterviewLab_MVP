import { Link } from 'react-router-dom';

export const APP_NAME = '[InterviewLab]';

/** Si recibe `to` funciona como enlace; durante la prueba se usa sin enlace para no salir por error. */
export default function Logo({ to }) {
  const content = (
    <span className="inline-flex items-baseline text-xl font-bold tracking-tight">
      {APP_NAME}
      <span
        aria-hidden="true"
        className="ml-1 inline-block h-[0.8em] w-[0.42em] translate-y-[0.08em] bg-hazard"
      />
    </span>
  );

  return to ? (
    <Link to={to} aria-label={`${APP_NAME}, ir al inicio`} className="rounded-sm">
      {content}
    </Link>
  ) : (
    content
  );
}
