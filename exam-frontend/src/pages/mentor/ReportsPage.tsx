import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, EmptyState, Skeleton, Tabs } from '@/components/ui';
import { ReportCard } from '@/features/mentor/components';
import { useReports, useUpdateReportStatus } from '@/features/mentor/hooks';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/lib/api';
import type { MentorReportStatus } from '@/types/mentor';

export default function ReportsPage() {
  const [status, setStatus] = useState<MentorReportStatus>('open');
  const reports = useReports(status);
  const update = useUpdateReportStatus();
  const toast = useToast();

  const handleUpdate = async (id: string, next: MentorReportStatus) => {
    try {
      await update.mutate({ id, status: next });
      toast.success(`Report ${next}`);
      reports.reload();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not update report.';
      toast.error('Update failed', msg);
    }
  };

  const content =
    reports.loading ? (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    ) : reports.data && reports.data.length > 0 ? (
      <div className="space-y-3">
        {reports.data.map((r) => (
          <ReportCard
            key={r.id}
            report={r}
            updating={update.loading}
            onUpdate={(next) => handleUpdate(r.id, next)}
          />
        ))}
      </div>
    ) : (
      <Card>
        <EmptyState
          icon={<AlertCircle className="h-6 w-6" />}
          title="No reports"
          description={`No ${status} reports right now.`}
        />
      </Card>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Issues flagged by students — review and resolve."
      />
      <Tabs
        items={[
          { key: 'open', label: 'Open', content: <div onClick={() => setStatus('open')}>{content}</div> },
          { key: 'resolved', label: 'Resolved', content: <div onClick={() => setStatus('resolved')}>{content}</div> },
          { key: 'dismissed', label: 'Dismissed', content: <div onClick={() => setStatus('dismissed')}>{content}</div> }
        ]}
        defaultValue="open"
      />
    </div>
  );
}
