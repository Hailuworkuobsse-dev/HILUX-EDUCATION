import { useEffect, useRef } from 'react';

/**
 * Calls `refetch` when the tab regains focus or visibility.
 * Useful for pages that fetch on mount and want to stay fresh when the
 * user tabs away and comes back.
 */
export function useRefreshOnFocus(refetch: () => void): void {
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') refetchRef.current();
    };
    window.addEventListener('focus', handler);
    document.addEventListener('visibilitychange', handler);
    return () => {
      window.removeEventListener('focus', handler);
      document.removeEventListener('visibilitychange', handler);
    };
  }, []);
}
