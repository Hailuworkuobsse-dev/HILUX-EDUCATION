import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  key: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  /** Controlled mode — when provided, `Tabs` renders `value` as active. */
  value?: string;
  /** Fires with the new key whenever the user clicks a tab. */
  onChange?: (key: string) => void;
  className?: string;
}

export function Tabs({ items, defaultValue, value, onChange, className }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.key ?? '');
  const active = value ?? internal;
  const current = items.find((i) => i.key === active);

  // Keep internal state in sync when `items` shrinks and the active key
  // no longer exists (e.g. review-queue emptied after resolving the last item).
  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(() => {
    if (value !== undefined) return; // controlled — caller owns it
    const exists = itemsRef.current.some((i) => i.key === active);
    if (!exists && itemsRef.current[0]) setInternal(itemsRef.current[0].key);
  }, [items, active, value]);

  const select = (key: string) => {
    if (value === undefined) setInternal(key);
    onChange?.(key);
  };

  return (
    <div className={className}>
      <div
        className="flex gap-1 overflow-x-auto border-b border-border no-scrollbar"
        role="tablist"
      >
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => !item.disabled && select(item.key)}
            disabled={item.disabled}
            aria-selected={active === item.key}
            role="tab"
            className={cn(
              'relative whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors focus-ring',
              active === item.key ? 'text-brand-300' : 'text-fg-muted hover:text-fg',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {item.label}
            {active === item.key && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-brand-500 to-accent-500" />
            )}
          </button>
        ))}
      </div>
      <div className="pt-4" role="tabpanel">
        {current?.content}
      </div>
    </div>
  );
}
