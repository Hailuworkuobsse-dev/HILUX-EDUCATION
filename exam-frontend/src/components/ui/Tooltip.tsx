import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  /** Tooltip text. */
  label: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}

/**
 * CSS-only tooltip (no portal, no JS positioning) — good enough for icon
 * buttons in toolbars. Uses `aria-describedby` so the text is exposed to
 * assistive tech even though it is visually hidden until hover/focus.
 */
export function Tooltip({ label, children, side = 'top', className }: TooltipProps) {
  const id = useId();

  return (
    <span className={cn('group relative inline-flex', className)} aria-describedby={id}>
      {children}
      <span
        id={id}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 z-50 w-max max-w-[220px] -translate-x-1/2 scale-95 rounded-lg border border-border bg-bg-elevated px-2 py-1 text-[11px] font-medium text-fg opacity-0 shadow-lg transition-all duration-150',
          'group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100',
          side === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
        )}
      >
        {label}
      </span>
    </span>
  );
}
