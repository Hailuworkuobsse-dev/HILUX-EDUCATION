import { useCallback, useState } from 'react';

/**
 * Small state helper for controlled Tabs usages.
 * Returns [activeKey, setActiveKey].
 */
export function useTabs<T extends string>(
  defaultValue: T
): [T, (key: T) => void] {
  const [active, setActive] = useState<T>(defaultValue);
  const setKey = useCallback((k: T) => setActive(k), []);
  return [active, setKey];
}
