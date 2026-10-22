import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, id, label, error, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <label htmlFor={inputId} className="relative inline-flex h-5 w-5 shrink-0 cursor-pointer">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-border bg-bg-surface transition-colors checked:border-brand-500 checked:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
          {...rest}
        />
        <Check className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 text-white opacity-0 peer-checked:opacity-100" />
      </label>
      {label && (
        <div className="text-sm text-fg">
          <label htmlFor={inputId} className="cursor-pointer">
            {label}
          </label>
          {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        </div>
      )}
    </div>
  );
});
