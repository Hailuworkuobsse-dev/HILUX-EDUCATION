import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type BadgeTone =
  | 'default'
  | 'brand'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** Render a leading coloured dot instead of relying on colour alone. */
  dot?: boolean;
}

const toneClasses: Record<BadgeTone, string> = {
  default: 'border-border bg-bg-elevated/70 text-fg-muted',
  brand: 'border-brand-500/30 bg-brand-500/10 text-brand-300',
  accent: 'border-accent-500/30 bg-accent-500/10 text-accent-300',
  success: 'border-success/30 bg-success/10 text-emerald-300',
  warning: 'border-warning/30 bg-warning/10 text-amber-300',
  danger: 'border-danger/30 bg-danger/10 text-rose-300',
  info: 'border-info/30 bg-info/10 text-sky-300'
};

const dotClasses: Record<BadgeTone, string> = {
  default: 'bg-fg-subtle',
  brand: 'bg-brand-400',
  accent: 'bg-accent-400',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info'
};

export function Badge({ tone = 'default', dot, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize',
        toneClasses[tone],
        className
      )}
      {...rest}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotClasses[tone])} />}
      {children}
    </span>
  );
}
