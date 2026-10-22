import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingScreenProps {
  /** Accessible text; hidden visually but announced. */
  label?: string;
  className?: string;
  /** Fill the viewport (route-level Suspense fallback). */
  fullScreen?: boolean;
}

export function LoadingScreen({
  label = 'Loading',
  className,
  fullScreen = true
}: LoadingScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullScreen ? 'min-h-[60vh] w-full' : 'w-full py-10',
        className
      )}
    >
      <span className="relative flex h-10 w-10 items-center justify-center">
        <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 animate-pulse-slow" />
        <Loader2 className="relative h-5 w-5 animate-spin text-brand-300" />
      </span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
