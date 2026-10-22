import { useEffect, useRef, useState } from 'react';

export interface UseCountdownResult {
  remaining: number;
  expired: boolean;
  reset: (seconds?: number) => void;
}

export function useCountdown(seconds: number, onEnd?: () => void): UseCountdownResult {
  const [remaining, setRemaining] = useState(seconds);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  useEffect(() => {
    if (remaining <= 0) {
      onEndRef.current?.();
      return;
    }
    const id = window.setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => window.clearTimeout(id);
  }, [remaining]);

  return {
    remaining,
    expired: remaining <= 0,
    reset: (s?: number) => setRemaining(s ?? seconds)
  };
}
