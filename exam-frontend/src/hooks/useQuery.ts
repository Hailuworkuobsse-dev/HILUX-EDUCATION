import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';

export interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  reload: () => void;
}

export function useQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  enabled = true
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<ApiError | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetcher()
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof ApiError ? e : new ApiError(0, 'Failed to load'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick, enabled]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, reload };
}
