import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/** Accessible toggle. Renders as a real checkbox input for form/AT support. */
export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  id,
  className
}: SwitchProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <button
        id={inputId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={typeof label === 'string' ? label : undefined}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors focus-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'border-brand-500/60 bg-brand-500/80' : 'border-border bg-bg-elevated'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>

      {(label || description) && (
        <label htmlFor={inputId} className="min-w-0 cursor-pointer text-sm">
          {label && <span className="block font-medium text-fg">{label}</span>}
          {description && (
            <span className="mt-0.5 block text-xs text-fg-muted">{description}</span>
          )}
        </label>
      )}
    </div>
  );
}
