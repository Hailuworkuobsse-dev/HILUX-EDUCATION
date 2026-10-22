import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMutation } from '@/hooks/useMutation';
import { ApiError } from '@/lib/api';

describe('useMutation', () => {
  it('returns data and tracks loading', async () => {
    const fn = vi.fn(async (n: number) => n * 2);
    const { result } = renderHook(() => useMutation<number, number>(fn));

    expect(result.current.loading).toBe(false);

    let promise!: Promise<number>;
    act(() => {
      promise = result.current.mutate(21);
    });
    expect(result.current.loading).toBe(true);

    await act(async () => {
      await expect(promise).resolves.toBe(42);
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(fn).toHaveBeenCalledWith(21);
  });

  it('wraps non-ApiError failures in an ApiError and rethrows', async () => {
    const { result } = renderHook(() =>
      useMutation<void, void>(async () => {
        throw new Error('boom');
      })
    );

    await act(async () => {
      await expect(result.current.mutate()).rejects.toBeInstanceOf(ApiError);
    });

    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(result.current.error?.message).toBe('boom');
    expect(result.current.error?.status).toBe(0);
    expect(result.current.loading).toBe(false);
  });

  it('fires onSuccess / onError callbacks', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const ok = renderHook(() => useMutation<string, void>(async () => 'done', { onSuccess }));
    await act(async () => {
      await ok.result.current.mutate();
    });
    expect(onSuccess).toHaveBeenCalledWith('done');

    const bad = renderHook(() =>
      useMutation<string, void>(
        async () => {
          throw new ApiError(403, 'nope', 'FORBIDDEN');
        },
        { onError }
      )
    );
    await act(async () => {
      await bad.result.current.mutate().catch(() => undefined);
    });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].code).toBe('FORBIDDEN');
  });

  // Regression: `mutate` used to be recreated every render because `fn` and
  // `options` were in its dependency array, which churned every useCallback
  // downstream (notably useAttemptRunner.setAnswer).
  it('keeps a stable `mutate` identity across re-renders', async () => {
    const { result, rerender } = renderHook(
      ({ n }: { n: number }) =>
        useMutation<number, void>(async () => n, { onSuccess: () => undefined }),
      { initialProps: { n: 1 } }
    );

    const first = result.current.mutate;
    rerender({ n: 2 });
    const second = result.current.mutate;
    rerender({ n: 3 });

    expect(second).toBe(first);
    expect(result.current.mutate).toBe(first);
    // …and it still calls the latest closure
    await act(async () => {
      await expect(result.current.mutate()).resolves.toBe(3);
    });
  });

  it('reset() clears the error', async () => {
    const { result } = renderHook(() =>
      useMutation<void, void>(async () => {
        throw new ApiError(500, 'server');
      })
    );

    await act(async () => {
      await result.current.mutate().catch(() => undefined);
    });
    expect(result.current.error).not.toBeNull();

    act(() => result.current.reset());
    await waitFor(() => expect(result.current.error).toBeNull());
  });
});
