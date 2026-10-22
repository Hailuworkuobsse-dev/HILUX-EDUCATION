import { useState } from 'react';
import { Clock } from 'lucide-react';
import { useInterval } from '@/hooks/useInterval';
import { formatClock } from '@/lib/date';
import { cn } from '@/lib/utils';

export interface AttemptTimerProps {
  startedAt: string;
  durationMinutes: number | null;
  onExpire?: () => void;
}

export function AttemptTimer({ startedAt, durationMinutes, onExpire }: AttemptTimerProps) {
  const [now, setNow] = useState(() => Date.now());
  useInterval(() => setNow(Date.now()), 1000);

  const start = new Date(startedAt).getTime();
  const elapsed = now - start;
  const remaining = durationMinutes ? durationMinutes * 60 * 1000 - elapsed : null;
  const display = remaining !== null ? formatClock(remaining) : formatClock(elapsed);
  const danger = remaining !== null && remaining < 5 * 60 * 1000;

  if (remaining !== null && remaining <= 0 && onExpire) onExpire();

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold tabular-nums',
        danger
          ? 'border-danger/40 bg-danger/10 text-rose-300'
          : 'border-border bg-bg-surface/60 text-fg-muted'
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      {display}
    </div>
  );
}
