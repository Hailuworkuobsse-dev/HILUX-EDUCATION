import { Coffee, Moon, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { MentorAvailability } from '@/types/mentor';
import { cn } from '@/lib/utils';

const options: { value: MentorAvailability; label: string; icon: LucideIcon; classes: string }[] = [
  {
    value: 'available',
    label: 'Available',
    icon: Zap,
    classes: 'border-success/40 bg-success/10 text-emerald-200'
  },
  {
    value: 'busy',
    label: 'Busy',
    icon: Coffee,
    classes: 'border-warning/40 bg-warning/10 text-amber-200'
  },
  {
    value: 'offline',
    label: 'Offline',
    icon: Moon,
    classes: 'border-border bg-bg-elevated text-fg-muted'
  }
];

export interface AvailabilityToggleProps {
  value: MentorAvailability;
  onChange: (v: MentorAvailability) => void;
  disabled?: boolean;
}

export function AvailabilityToggle({ value, onChange, disabled }: AvailabilityToggleProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((o) => {
        const Icon = o.icon;
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            disabled={disabled}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors focus-ring',
              active ? o.classes : 'border-border bg-bg-surface/60 text-fg-muted hover:border-brand-500/40',
              'disabled:cursor-not-allowed disabled:opacity-60'
            )}
            aria-pressed={active}
          >
            <Icon className="h-4 w-4" />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
