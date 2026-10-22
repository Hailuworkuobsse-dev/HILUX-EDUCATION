import { useEffect, useState } from 'react';
import { mentorApi } from '../api';

const POLL_MS = 30000;

export function useUnreadThreadCount(enabled: boolean): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setCount(0);
      return;
    }
    let cancelled = false;
    const fetchCount = async () => {
      try {
        const { count: c } = await mentorApi.unreadThreadCount();
        if (!cancelled) setCount(c);
      } catch {
        /* silent */
      }
    };
    fetchCount();
    const id = window.setInterval(fetchCount, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [enabled]);

  return count;
}
