import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { MenteeRiskLevel } from '@/types/mentor';

const config = {
  low: { tone: 'success' as const, label: 'On track', icon: CheckCircle2 },
  medium: { tone: 'warning' as const, label: 'Watch', icon: AlertCircle },
  high: { tone: 'danger' as const, label: 'At risk', icon: AlertTriangle }
};

export function RiskBadge({ level }: { level: MenteeRiskLevel }) {
  const c = config[level];
  const Icon = c.icon;
  return (
    <Badge tone={c.tone}>
      <Icon className="h-3 w-3" /> {c.label}
    </Badge>
  );
}
