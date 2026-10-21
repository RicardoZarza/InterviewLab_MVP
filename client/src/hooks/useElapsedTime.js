import { useEffect, useState } from 'react';

/** Milisegundos transcurridos desde startMs. Se actualiza cada segundo mientras `running` sea true. */
export function useElapsedTime(startMs, running) {
  const [elapsed, setElapsed] = useState(() => (startMs ? Date.now() - startMs : 0));

  useEffect(() => {
    if (!startMs) {
      setElapsed(0);
      return undefined;
    }

    const tick = () => setElapsed(Date.now() - startMs);
    tick();

    if (!running) return undefined;

    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [startMs, running]);

  return elapsed;
}
