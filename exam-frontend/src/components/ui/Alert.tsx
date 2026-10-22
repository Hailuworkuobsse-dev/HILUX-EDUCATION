import type { HTMLAttributes, ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger' | 'brand';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: AlertTone;
  title?: ReactNode;
  /** Optional trailing element (e.g. a dismiss or retry button). */
  action?: ReactNode;
}

const toneClasses: Record<AlertTone, string> = {
  info: 'border-info/30 bg-info/10 text-sky-200',
  success: 'border-success/30 bg-success/10 text-emerald-200',
  warning: 'border-warning/30 bg-warning/10 text-amber-200',
  danger: 'border-danger/30 bg-danger/10 text-rose-200',
  brand: 'border-brand-500/30 bg-brand-500/10 text-brand-200'
};

const icons: Record<AlertTone, ReactNode> = {
  info: <Info className="h-4 w-4 shrink-0 text-info" />,
  success: <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />,
  warning: <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />,
  danger: <XCircle className="h-4 w-4 shrink-0 text-danger" />,
  brand: <Info className="h-4 w-4 shrink-0 text-brand-300" />
};

export function Alert({
  tone = 'info',
  title,
  action,
  className,
  children,
  ...rest
}: AlertProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2.5 rounded-xl border p-3 text-sm',
        toneClasses[tone],
        className
      )}
      {...rest}
    >
      {icons[tone]}
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && (
          <div className={cn('text-xs leading-relaxed opacity-90', title && 'mt-1')}>
            {children}
          </div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
