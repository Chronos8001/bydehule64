import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../services/api';

/** Union discriminée : l'état est fini, TypeScript force à traiter chaque cas. */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: ApiError }
  | { status: 'success'; data: T };

export function useApiResource<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: readonly unknown[],
): { state: AsyncState<T>; reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' });
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    setState({ status: 'loading' });

    fetcher(controller.signal)
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data });
      })
      .catch((error: unknown) => {
        if (cancelled || controller.signal.aborted) return;
        setState({
          status: 'error',
          error:
            error instanceof ApiError
              ? error
              : new ApiError(0, 'SERVER_ERROR', 'Erreur inattendue.'),
        });
      });

    // Nettoyage : la réponse d'une requête obsolète ne peut plus écraser la nouvelle.
    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  return { state, reload };
}
