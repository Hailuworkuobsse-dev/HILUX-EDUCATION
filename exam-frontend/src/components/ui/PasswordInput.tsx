import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  error?: string;
  hint?: ReactNode;
  leftIcon?: ReactNode;
  containerClassName?: string;
}

/** Text input with a built-in show/hide toggle. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    { className, containerClassName, id, label, error, hint, leftIcon, ...rest },
    ref
  ) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const [visible, setVisible] = useState(false);
    const toggleId = `${inputId}-toggle`;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-fg">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={visible ? 'text' : 'password'}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              'h-10 w-full rounded-xl border bg-bg-elevated/60 pr-10 text-sm text-fg placeholder:text-fg-subtle',
              'transition-colors focus:border-brand-500/70 focus:outline-none focus:ring-2 focus:ring-brand-500/25',
              'disabled:cursor-not-allowed disabled:opacity-60',
              error ? 'border-danger/60' : 'border-border',
              leftIcon ? 'pl-9' : 'pl-3',
              className
            )}
            {...rest}
          />

          <button
            id={toggleId}
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-controls={inputId}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-fg-subtle transition-colors hover:text-fg focus-ring"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {error ? (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-danger">
            {error}
          </p>
        ) : (
          hint && (
            <p id={`${inputId}-hint`} className="mt-1 text-xs text-fg-subtle">
              {hint}
            </p>
          )
        )}
      </div>
    );
  }
);
