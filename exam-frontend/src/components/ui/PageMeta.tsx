import { useEffect } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export interface PageMetaProps {
  title?: string;
  description?: string;
}

/**
 * Sets document title + meta description for the current route.
 * Renders nothing.
 *
 * The description is applied in an effect (not during render) so it is safe
 * under StrictMode and server-side rendering.
 */
export function PageMeta({ title, description }: PageMetaProps) {
  useDocumentTitle(title);

  useEffect(() => {
    if (!description || typeof document === 'undefined') return;

    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', description);
  }, [description]);

  return null;
}
