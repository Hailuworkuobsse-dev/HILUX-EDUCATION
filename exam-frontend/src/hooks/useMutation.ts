import { useCallback, useRef, useState } from 'react';
import { ApiError } from '@/lib/api';

type MutationFn<TData, TVars> = (vars: TVars) => Promise<TData>;

export interface UseMutationOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: ApiError) => void;
}

export interface UseMutationResult<TData, TVars> {
  mutate: (vars: TVars) => Promise<TData>;
  loading: boolean;
  error: ApiError | null;
  reset: () => void;
}

/**
 * Fires a stateful async mutation.
 *
 * `mutate` is fully stable across renders — both `fn` and `options` are
 * captured via refs so callers can pass inline closures without causing
 * `mutate` identity churn (which previously broke `useCallback` deps and
 * caused unnecessary re-renders in consumers like `useAttemptRunner`).
 */
export function useMutation<TData, TVars>(
  fn: MutationFn<TData, TVars>,
  options: UseMutationOptions<TData> = {}
): UseMutationResult<TData, TVars> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fnRef = useRef(fn);
  fnRef.current = fn;
  const onSuccessRef = useRef(options.onSuccess);
  onSuccessRef.current = options.onSuccess;
  const onErrorRef = useRef(options.onError);
  onErrorRef.current = options.onError;

  const mutate = useCallback(async (vars: TVars): Promise<TData> => {
    setLoading(true);
    setError(null);
    try {
      const data = await fnRef.current(vars);
      onSuccessRef.current?.(data);
      return data;
    } catch (e) {
      const err =
        e instanceof ApiError
          ? e
          : new ApiError(0, e instanceof Error ? e.message : 'Network error');
      setError(err);
      onErrorRef.current?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => setError(null), []);

  return { mutate, loading, error, reset };
}
