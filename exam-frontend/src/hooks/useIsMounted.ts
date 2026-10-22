import { useEffect, useRef } from 'react';

/**
 * Returns a stable `isMounted()` predicate so async work can skip state
 * updates after unmount.
 */
export function useIsMounted(): () => boolean {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return () => mountedRef.current;
}
