import { AlertCircle, Check, X } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import type { MentorReport, MentorReportStatus } from '@/types/mentor';
import { formatRelative } from '@/lib/date';

const statusTone: Record<MentorReportStatus, 'warning' | 'success' | 'default'> = {
  open: 'warning',
  resolved: 'success',
  dismissed: 'default'
};

export interface ReportCardProps {
  report: MentorReport;
  onUpdate: (status: MentorReportStatus) => Promise<void>;
  updating: boolean;
}

export function ReportCard({ report, onUpdate, updating }: ReportCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <AlertCircle className="h-4 w-4 text-warning" />
            <p className="text-sm font-semibold">{report.reason}</p>
            <Badge tone={statusTone[report.status]}>{report.status}</Badge>
          </div>
          <p className="mt-1 text-xs text-fg-muted">
            By <span className="text-fg">{report.studentName}</span> · {formatRelative(report.createdAt)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm text-fg">{report.description}</p>
      {report.status === 'open' && (
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="success"
            leftIcon={<Check className="h-3.5 w-3.5" />}
            disabled={updating}
            onClick={() => onUpdate('resolved')}
          >
            Resolve
          </Button>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<X className="h-3.5 w-3.5" />}
            disabled={updating}
            onClick={() => onUpdate('dismissed')}
          >
            Dismiss
          </Button>
        </div>
      )}
    </Card>
  );
}
