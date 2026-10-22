import { useCallback, useState } from 'react';

/**
 * `useState` persisted to localStorage. Falls back to in-memory state when
 * storage is unavailable (private browsing, SSR).
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? initialValue : (JSON.parse(raw) as T);
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStored((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* ignore quota / privacy-mode errors */
        }
        return next;
      });
    },
    [key]
  );

  return [stored, setValue];
}
