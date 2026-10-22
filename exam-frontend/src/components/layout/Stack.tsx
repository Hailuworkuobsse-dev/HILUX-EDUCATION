import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /** Spacing between children, as a Tailwind gap step. */
  gap?: 0 | 1 | 2 | 3 | 4 | 6 | 8;
  direction?: 'vertical' | 'horizontal';
  align?: 'start' | 'center' | 'end' | 'stretch';
}

const gapClasses = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  6: 'gap-6',
  8: 'gap-8'
} as const;

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch'
} as const;

/** Flexbox stack — the layout primitive for evenly spaced rows/columns. */
export function Stack({
  gap = 3,
  direction = 'vertical',
  align = 'stretch',
  className,
  children,
  ...rest
}: StackProps) {
  return (
    <div
      className={cn(
        'flex',
        direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        gapClasses[gap],
        alignClasses[align],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
