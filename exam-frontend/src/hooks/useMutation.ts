import { useCallback, useState } from 'react';
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

export function useMutation<TData, TVars>(
  fn: MutationFn<TData, TVars>,
  options: UseMutationOptions<TData> = {}
): UseMutationResult<TData, TVars> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(
    async (vars: TVars): Promise<TData> => {
      setLoading(true);
      setError(null);
      try {
        const data = await fn(vars);
        options.onSuccess?.(data);
        return data;
      } catch (e) {
        const err =
          e instanceof ApiError
            ? e
            : new ApiError(0, e instanceof Error ? e.message : 'Network error');
        setError(err);
        options.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fn, options]
  );

  return { mutate, loading, error, reset: () => setError(null) };
}
