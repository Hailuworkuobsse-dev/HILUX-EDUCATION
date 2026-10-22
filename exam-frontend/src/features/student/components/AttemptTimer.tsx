import { useEffect, useRef, useState } from 'react';
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

  // `onExpire` must not be called during render — it sets state in the parent,
  // which React rejects (and would loop). Fire it once, from an effect.
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    if (remaining !== null && remaining <= 0) {
      firedRef.current = true;
      onExpireRef.current?.();
    }
  }, [remaining]);

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold tabular-nums',
        danger
          ? 'border-danger/40 bg-danger/10 text-rose-300'
          : 'border-border bg-bg-surface/60 text-fg-muted'
      )}
      role="timer"
      aria-label={remaining !== null ? 'Time remaining' : 'Time elapsed'}
    >
      <Clock className="h-3.5 w-3.5" />
      {display}
    </div>
  );
}
