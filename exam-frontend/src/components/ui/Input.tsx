import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
  hint?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Wraps the input in a container — set false when composing your own layout. */
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, containerClassName, id, label, error, hint, leftIcon, rightIcon, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
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
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-10 w-full rounded-xl border bg-bg-elevated/60 text-sm text-fg placeholder:text-fg-subtle',
            'transition-colors focus:border-brand-500/70 focus:outline-none focus:ring-2 focus:ring-brand-500/25',
            'disabled:cursor-not-allowed disabled:opacity-60',
            error ? 'border-danger/60' : 'border-border',
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            !leftIcon && 'pl-3',
            !rightIcon && 'pr-3',
            className
          )}
          {...rest}
        />

        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle">
            {rightIcon}
          </span>
        )}
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
});
