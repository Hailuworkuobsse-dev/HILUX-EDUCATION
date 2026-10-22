import { useEffect, useRef } from 'react';

/**
 * Returns a ref to attach to an element; `handler` fires on a pointer-down or
 * Escape outside of it. Used for dropdowns, menus and popovers.
 *
 * ```tsx
 * const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
 * ```
 */
export function useClickOutside<T extends HTMLElement>(handler: () => void) {
  const ref = useRef<T>(null);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const node = ref.current;
      if (!node) return;
      if (event.target instanceof Node && !node.contains(event.target)) {
        handlerRef.current();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && ref.current) handlerRef.current();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return ref;
}
