import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SpinnerProps {
  className?: string;
  /** Accessible label; pass `null` to render a purely decorative spinner. */
  label?: string | null;
}

export function Spinner({ className, label = 'Loading' }: SpinnerProps) {
  return (
    <Loader2
      className={cn('h-4 w-4 animate-spin text-brand-300', className)}
      aria-hidden={label ? undefined : true}
      aria-label={label ?? undefined}
      role={label ? 'status' : undefined}
    />
  );
}
