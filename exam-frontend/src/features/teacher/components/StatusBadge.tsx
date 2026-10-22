import { AlertCircle, Archive, CheckCircle2, FileEdit, Send } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { QuestionStatus } from '@/lib/constants';

type Status = QuestionStatus;

const config: Record<Status, { tone: 'default' | 'brand' | 'warning' | 'success'; label: string; icon: typeof FileEdit }> = {
  draft: { tone: 'default', label: 'Draft', icon: FileEdit },
  review: { tone: 'warning', label: 'In review', icon: AlertCircle },
  published: { tone: 'success', label: 'Published', icon: CheckCircle2 },
  archived: { tone: 'default', label: 'Archived', icon: Archive }
};

export function StatusBadge({ status }: { status: Status }) {
  const c = config[status];
  const Icon = c.icon;
  return (
    <Badge tone={c.tone}>
      <Icon className="h-3 w-3" /> {c.label}
    </Badge>
  );
}

export const STATUS_ICONS = { draft: FileEdit, review: Send, published: CheckCircle2, archived: Archive };
