import { GraduationCap, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SelectableRole = 'student' | 'mentor';

export interface RoleSelectorProps {
  value: SelectableRole;
  onChange: (v: SelectableRole) => void;
  error?: string;
}

const options = [
  { value: 'student' as const, icon: GraduationCap, title: 'Student', description: 'Practice & improve' },
  { value: 'mentor' as const, icon: Users, title: 'Mentor', description: 'Help other students' }
];

export function RoleSelector({ value, onChange, error }: RoleSelectorProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-fg">I am a…</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((o) => {
          const Icon = o.icon;
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={cn(
                'flex flex-col gap-2 rounded-xl border p-3 text-left transition-colors focus-ring',
                active
                  ? 'border-brand-400 bg-brand-500/10'
                  : 'border-border bg-bg-surface/60 hover:border-brand-500/50'
              )}
              aria-pressed={active}
            >
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg',
                  active ? 'bg-brand-500/20 text-brand-200' : 'bg-white/5 text-fg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">{o.title}</p>
                <p className="text-xs text-fg-muted">{o.description}</p>
              </div>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
