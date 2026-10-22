import { useEffect } from 'react';

export function useBeforeUnload(active: boolean, message = 'You have unsaved answers.'): void {
  useEffect(() => {
    if (!active) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [active, message]);
}
