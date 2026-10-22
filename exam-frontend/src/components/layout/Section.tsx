import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  /** Right-aligned control for the section (a button, a filter, …). */
  action?: ReactNode;
}

/** Titled page section with an optional heading row. */
export function Section({
  title,
  description,
  action,
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <section className={cn('space-y-3', className)} {...rest}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">
                {title}
              </h2>
            )}
            {description && <p className="mt-0.5 text-xs text-fg-subtle">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
