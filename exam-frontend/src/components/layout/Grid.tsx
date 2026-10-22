import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type GridColumns = 1 | 2 | 3 | 4;

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** Columns at the `sm` breakpoint and up. */
  columns?: GridColumns;
  gap?: number;
}

const columnClasses: Record<GridColumns, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4'
};

/** Responsive grid — one column on phones, `columns` from `sm` up. */
export function Grid({ columns = 2, className, children, ...rest }: GridProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-3', columnClasses[columns], className)} {...rest}>
      {children}
    </div>
  );
}
