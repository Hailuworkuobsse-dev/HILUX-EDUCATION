import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OptionCardProps {
  label: string;
  text: string;
  selected: boolean;
  onClick: () => void;
}

export function OptionCard({ label, text, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all focus-ring sm:p-4',
        selected
          ? 'border-brand-400 bg-brand-500/10 shadow-lg shadow-brand-900/20'
          : 'border-border bg-bg-surface/60 hover:border-brand-500/50 hover:bg-white/[0.04]'
      )}
      aria-pressed={selected}
    >
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
          selected ? 'bg-brand-500 text-white' : 'bg-white/5 text-fg-muted group-hover:bg-white/10'
        )}
      >
        {selected ? <Check className="h-3.5 w-3.5" /> : label}
      </span>
      <span className="flex-1 text-sm text-fg">{text}</span>
    </button>
  );
}
