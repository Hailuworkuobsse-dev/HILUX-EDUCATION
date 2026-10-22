import { cn } from '@/lib/utils';

export type ProgressTone = 'brand' | 'accent' | 'success' | 'warning' | 'danger';
export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ProgressProps {
  /** Current value. */
  value: number;
  /** Upper bound — defaults to 100 (i.e. `value` is a percentage). */
  max?: number;
  tone?: ProgressTone;
  size?: ProgressSize;
  className?: string;
  label?: string;
}

const toneClasses: Record<ProgressTone, string> = {
  brand: 'bg-gradient-to-r from-brand-500 to-brand-400',
  accent: 'bg-gradient-to-r from-accent-500 to-accent-400',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger'
};

const sizeClasses: Record<ProgressSize, string> = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3'
};

export function Progress({
  value,
  max = 100,
  tone = 'brand',
  size = 'md',
  className,
  label
}: ProgressProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('w-full overflow-hidden rounded-full bg-bg-elevated', sizeClasses[size], className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-300', toneClasses[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
