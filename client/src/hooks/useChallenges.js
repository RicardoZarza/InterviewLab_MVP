import { useCallback, useEffect, useState } from 'react';
import { listChallenges } from '@/services/interviewService';

export function useChallenges() {
  const [state, setState] = useState({ challenges: [], isLoading: true, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, isLoading: true, error: null }));

    listChallenges({ signal: controller.signal })
      .then((challenges) => setState({ challenges, isLoading: false, error: null }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState({ challenges: [], isLoading: false, error: error.message });
      });

    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return { ...state, retry };
}
