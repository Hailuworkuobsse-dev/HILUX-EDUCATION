import {
  forwardRef,
  isValidElement,
  cloneElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode
} from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-900/30 hover:from-brand-400 hover:to-brand-500 active:from-brand-600 active:to-brand-700',
  secondary: 'bg-bg-elevated text-fg border border-border hover:bg-bg-surface active:bg-bg-base',
  ghost: 'text-fg hover:bg-white/5 active:bg-white/10',
  outline: 'border border-brand-500/60 text-brand-200 hover:bg-brand-500/10 active:bg-brand-500/20',
  danger: 'bg-danger text-white hover:bg-danger/90 active:bg-danger/80',
  success: 'bg-success text-white hover:bg-success/90 active:bg-success/80'
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-10 w-10'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth,
    children,
    disabled,
    asChild,
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;
  const classes = cn(
    'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150 focus-ring',
    'disabled:pointer-events-none disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    className
  );

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string; children?: ReactNode }>;

    // Strip button-only attributes so we don't end up with `<a disabled>`.
    const {
      type: _type,
      disabled: _disabled,
      form: _form,
      name: _name,
      value: _value,
      ...forwardable
    } = rest as Record<string, unknown>;

    return cloneElement(child, {
      ...(forwardable as Record<string, unknown>),
      className: cn(classes, child.props.className),
      children: (
        <>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            leftIcon
          )}
          {child.props.children}
          {rightIcon}
        </>
      )
    } as Record<string, unknown>);
  }

  return (
    <button ref={ref} disabled={isDisabled} className={classes} {...rest}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : leftIcon}
      {children}
      {rightIcon}
    </button>
  );
});
