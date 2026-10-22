import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastTone = 'success' | 'error' | 'info' | 'warning';

export interface ToastApi {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  dismiss: (id: string) => void;
}

interface ToastItem {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
}

const ToastContext = createContext<ToastApi | null>(null);

const TONE_STYLES: Record<ToastTone, { wrap: string; icon: ReactNode }> = {
  success: {
    wrap: 'border-success/40 bg-success/10 text-emerald-200',
    icon: <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
  },
  error: {
    wrap: 'border-danger/40 bg-danger/10 text-rose-200',
    icon: <XCircle className="h-4 w-4 shrink-0 text-danger" />
  },
  warning: {
    wrap: 'border-warning/40 bg-warning/10 text-amber-200',
    icon: <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
  },
  info: {
    wrap: 'border-info/40 bg-info/10 text-sky-200',
    icon: <Info className="h-4 w-4 shrink-0 text-info" />
  }
};

const DURATION: Record<ToastTone, number> = {
  success: 3500,
  error: 6000,
  warning: 5000,
  info: 4000
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (tone: ToastTone, title: string, description?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev.slice(-3), { id, tone, title, description }]);
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), DURATION[tone])
      );
    },
    [dismiss]
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((timer) => window.clearTimeout(timer));
      map.clear();
    };
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, description) => push('success', title, description),
      error: (title, description) => push('error', title, description),
      info: (title, description) => push('info', title, description),
      warning: (title, description) => push('warning', title, description),
      dismiss
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-3 bottom-3 z-[100] flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-96"
      >
        {toasts.map((toast) => {
          const tone = TONE_STYLES[toast.tone];
          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                'pointer-events-auto flex items-start gap-2.5 rounded-xl border bg-bg-elevated/95 p-3 shadow-xl backdrop-blur animate-slide-up',
                tone.wrap
              )}
            >
              {tone.icon}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description && (
                  <p className="mt-0.5 break-words text-xs text-fg-muted">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="rounded-md p-0.5 text-fg-subtle transition-colors hover:text-fg focus-ring"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
