import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface DividerProps {
  /** Optional centred label, e.g. "or". */
  label?: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Divider({ label, orientation = 'horizontal', className }: DividerProps) {
  if (orientation === 'vertical') {
    return <div className={cn('h-auto w-px self-stretch bg-border', className)} role="separator" />;
  }

  if (!label) {
    return <hr className={cn('border-0 border-t border-border', className)} role="separator" />;
  }

  return (
    <div className={cn('flex items-center gap-3', className)} role="separator">
      <span className="h-px flex-1 bg-border" />
      <span className="text-[11px] font-medium uppercase tracking-wide text-fg-subtle">
        {label}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
