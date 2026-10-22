import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type IconButtonTone = 'default' | 'brand' | 'danger' | 'success';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required — becomes the accessible name (there is no visible text). */
  label: string;
  size?: IconButtonSize;
  tone?: IconButtonTone;
  children: ReactNode;
}

const sizeClasses: Record<IconButtonSize, string> = {
  xs: 'h-7 w-7',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12'
};

const toneClasses: Record<IconButtonTone, string> = {
  default: 'border-border bg-bg-elevated/60 text-fg-muted hover:text-fg hover:bg-bg-surface',
  brand: 'border-brand-500/40 bg-brand-500/10 text-brand-200 hover:bg-brand-500/20',
  danger: 'border-danger/40 bg-danger/10 text-rose-300 hover:bg-danger/20',
  success: 'border-success/40 bg-success/10 text-emerald-300 hover:bg-success/20'
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, size = 'md', tone = 'default', className, children, type = 'button', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-xl border transition-colors focus-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        sizeClasses[size],
        toneClasses[tone],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
