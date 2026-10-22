import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  error?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { className, label, error, ...rest },
  ref
) {
  const input = (
    <input
      ref={ref}
      type="radio"
      className={cn(
        'h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-full border bg-bg-surface transition-colors',
        'checked:border-[5px] checked:border-brand-500 checked:bg-bg-surface',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error ? 'border-danger/60' : 'border-border',
        className
      )}
      {...rest}
    />
  );

  if (!label) return input;

  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-fg">
      {input}
      <span>{label}</span>
    </label>
  );
});
