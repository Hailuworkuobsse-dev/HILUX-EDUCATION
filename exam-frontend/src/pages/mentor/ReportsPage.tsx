import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, EmptyState, Skeleton, Tabs } from '@/components/ui';
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
    try { await update.mutate({ id, status: next }); toast.success(`Report ${next}`); reports.reload(); }
    catch (e) { toast.error('Update failed', e instanceof ApiError ? e.message : 'Could not update report.'); }
  };

  const content = reports.loading ? <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-32" />)}</div>
    : reports.error ? <Card className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="text-sm font-semibold">Reports could not be loaded</p><p className="text-xs text-fg-muted">{reports.error.message}</p></div><Button variant="secondary" onClick={reports.reload}>Retry</Button></Card>
    : reports.data && reports.data.length > 0 ? <div className="space-y-3">{reports.data.map((r) => <ReportCard key={r.id} report={r} updating={update.loading} onUpdate={(next) => handleUpdate(r.id, next)} />)}</div>
    : <Card><EmptyState icon={<AlertCircle className="h-6 w-6" />} title="No reports" description={`No ${status} reports right now.`} /></Card>;

  return <div className="space-y-6"><PageHeader title="Reports" description="Issues flagged by students — review and resolve." /><Tabs items={[{ key: 'open', label: 'Open', content }, { key: 'resolved', label: 'Resolved', content }, { key: 'dismissed', label: 'Dismissed', content }]} value={status} onChange={(key) => setStatus(key as MentorReportStatus)} /></div>;
}
