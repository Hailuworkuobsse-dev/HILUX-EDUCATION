import { forwardRef, useId, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  error?: string;
  hint?: ReactNode;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, containerClassName, id, label, error, hint, rows = 4, ...rest },
  ref
) {
  const autoId = useId();
  const textareaId = id ?? autoId;
  const describedBy = error
    ? `${textareaId}-error`
    : hint
      ? `${textareaId}-hint`
      : undefined;

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-fg">
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'w-full resize-y rounded-xl border bg-bg-elevated/60 p-3 text-sm text-fg placeholder:text-fg-subtle',
          'transition-colors focus:border-brand-500/70 focus:outline-none focus:ring-2 focus:ring-brand-500/25',
          'disabled:cursor-not-allowed disabled:opacity-60',
          error ? 'border-danger/60' : 'border-border',
          className
        )}
        {...rest}
      />

      {error ? (
        <p id={`${textareaId}-error`} className="mt-1 text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${textareaId}-hint`} className="mt-1 text-xs text-fg-subtle">
            {hint}
          </p>
        )
      )}
    </div>
  );
});
