import { useEffect, useRef } from 'react';

export function useInterval(callback: () => void, delayMs: number | null): void {
  const savedRef = useRef(callback);
  useEffect(() => {
    savedRef.current = callback;
  }, [callback]);
  useEffect(() => {
    if (delayMs === null) return;
    const id = window.setInterval(() => savedRef.current(), delayMs);
    return () => window.clearInterval(id);
  }, [delayMs]);
}
