import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  /** Optional call to action (a Button, usually with `asChild` + a Link). */
  action?: ReactNode;
  className?: string;
  /** Compact variant for inline/side panels. */
  compact?: boolean;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  compact
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-bg-surface/40 text-center',
        compact ? 'gap-2 px-4 py-6' : 'gap-3 px-6 py-12',
        className
      )}
    >
      {icon && (
        <span
          className={cn(
            'flex items-center justify-center rounded-2xl border border-border bg-bg-elevated/60 text-fg-subtle',
            compact ? 'h-9 w-9' : 'h-12 w-12'
          )}
        >
          {icon}
        </span>
      )}

      <div className="max-w-sm space-y-1">
        <p className={cn('font-semibold text-fg', compact ? 'text-sm' : 'text-base')}>{title}</p>
        {description && (
          <p className="text-xs leading-relaxed text-fg-muted">{description}</p>
        )}
      </div>

      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
