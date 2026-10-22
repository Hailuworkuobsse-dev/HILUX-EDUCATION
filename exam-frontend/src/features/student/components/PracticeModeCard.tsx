import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PracticeModeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}

export function PracticeModeCard({
  icon: Icon,
  title,
  description,
  active,
  onClick
}: PracticeModeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col gap-2 rounded-xl border p-4 text-left transition-colors focus-ring',
        active ? 'border-brand-400 bg-brand-500/10' : 'border-border bg-bg-surface/60 hover:border-brand-500/50'
      )}
      aria-pressed={active}
    >
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg',
          active ? 'bg-brand-500/20 text-brand-200' : 'bg-white/5 text-fg-muted'
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-fg-muted">{description}</p>
    </button>
  );
}
