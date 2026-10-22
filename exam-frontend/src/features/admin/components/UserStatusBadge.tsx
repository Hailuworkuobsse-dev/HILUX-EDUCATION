import { Ban, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { AdminUserStatus } from '@/types/admin';

const config = {
  active: { tone: 'success' as const, label: 'Active', icon: CheckCircle2 },
  suspended: { tone: 'danger' as const, label: 'Suspended', icon: Ban },
  pending_verification: { tone: 'warning' as const, label: 'Pending', icon: Clock }
};

export function UserStatusBadge({ status }: { status: AdminUserStatus }) {
  const c = config[status];
  const Icon = c.icon;
  return (
    <Badge tone={c.tone}>
      <Icon className="h-3 w-3" /> {c.label}
    </Badge>
  );
}
