import { Progress } from '@/components/ui/Progress';

export interface AttemptProgressProps {
  answered: number;
  total: number;
}

export function AttemptProgress({ answered, total }: AttemptProgressProps) {
  return (
    <div className="flex items-center gap-3">
      <Progress value={answered} max={total} size="sm" className="flex-1" />
      <span className="shrink-0 text-[11px] font-medium text-fg-muted">
        {answered}/{total}
      </span>
    </div>
  );
}
