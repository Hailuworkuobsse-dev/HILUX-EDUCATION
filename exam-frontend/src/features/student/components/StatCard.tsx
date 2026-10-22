import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  tone?: 'brand' | 'accent' | 'success' | 'warning';
}

const toneClasses = {
  brand: 'bg-brand-500/10 text-brand-300',
  accent: 'bg-accent-500/10 text-accent-300',
  success: 'bg-success/10 text-emerald-300',
  warning: 'bg-warning/10 text-amber-300'
};

export function StatCard({ label, value, icon: Icon, hint, tone = 'brand' }: StatCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">{label}</p>
          <p className="mt-1 text-2xl font-bold text-fg">{value}</p>
          {hint && <p className="mt-1 text-xs text-fg-subtle">{hint}</p>}
        </div>
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', toneClasses[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </Card>
  );
}
