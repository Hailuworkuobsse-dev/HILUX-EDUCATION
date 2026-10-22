import { useEffect } from 'react';
import { APP } from '@/lib/constants';

/**
 * Sets the document title for the current page.
 * Restores the base title on unmount.
 */
export function useDocumentTitle(title: string | null | undefined): void {
  useEffect(() => {
    const base = document.title;
    document.title = title ? `${title} · ${APP.NAME}` : APP.NAME;
    return () => {
      document.title = base;
    };
  }, [title]);
}
