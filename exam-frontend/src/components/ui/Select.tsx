import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  error?: string;
  hint?: ReactNode;
  options: SelectOption[];
  /** Rendered as a disabled first option when no value is selected. */
  placeholder?: string;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, containerClassName, id, label, error, hint, options, placeholder, ...rest },
  ref
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-fg">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-10 w-full appearance-none rounded-xl border bg-bg-elevated/60 pl-3 pr-9 text-sm text-fg',
            'transition-colors focus:border-brand-500/70 focus:outline-none focus:ring-2 focus:ring-brand-500/25',
            'disabled:cursor-not-allowed disabled:opacity-60',
            error ? 'border-danger/60' : 'border-border',
            className
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
      </div>

      {error ? (
        <p id={`${selectId}-error`} className="mt-1 text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${selectId}-hint`} className="mt-1 text-xs text-fg-subtle">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
);
