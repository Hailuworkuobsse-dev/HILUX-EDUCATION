import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeClasses: Record<ModalSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl'
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: ModalSize;
  title?: ReactNode;
  description?: ReactNode;
  /** Sticky action row (pass your own Buttons). */
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Clicking the backdrop closes the modal. Default true. */
  dismissible?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  footer,
  children,
  className,
  size = 'md',
  dismissible = true
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dismissible) onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, dismissible]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={cn(
          'relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-bg-surface shadow-2xl animate-slide-up sm:rounded-2xl',
          sizeClasses[size],
          className
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
            <div className="min-w-0">
              {title && <h2 className="text-base font-semibold text-fg">{title}</h2>}
              {description && (
                <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">{description}</p>
              )}
            </div>
            {dismissible && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="-mr-1 shrink-0 rounded-lg p-1.5 text-fg-subtle transition-colors hover:bg-white/5 hover:text-fg focus-ring"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {children && <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>}

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-border bg-bg-elevated/40 px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
