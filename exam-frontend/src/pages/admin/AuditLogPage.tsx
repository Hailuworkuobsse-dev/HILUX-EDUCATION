import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ScrollText, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, EmptyState, Input, Select, Skeleton } from '@/components/ui';
import { AuditLogTable } from '@/features/admin/components';
import { useAuditLog } from '@/features/admin/hooks';
import { useDebounce } from '@/hooks/useDebounce';
import { ADMIN_AUDIT_ACTIONS } from '@/types/admin';

const RESOURCE_TYPES = ['user', 'order', 'payment', 'question', 'paper', 'content', 'role'];

export default function AuditLogPage() {
  const [params] = useSearchParams();
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search, 300);
  const actorId = params.get('actorId') ?? undefined;

  const log = useAuditLog({
    actorId,
    search: debounced || undefined,
    action: action || undefined,
    resourceType: resourceType || undefined,
    page,
    pageSize: 50
  });

  const totalPages = log.data?.totalPages ?? 1;
  const rows = useMemo(() => log.data?.items ?? [], [log.data]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit log"
        description="Every privileged action, who did it, and when."
      />

      <Card className="grid gap-3 p-3 sm:grid-cols-3">
        <Input
          placeholder="Search actions / actors…"
          leftIcon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Select
          options={[
            { value: '', label: 'All actions' },
            ...ADMIN_AUDIT_ACTIONS.map((a) => ({ value: a, label: a }))
          ]}
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
        />
        <Select
          options={[
            { value: '', label: 'All resources' },
            ...RESOURCE_TYPES.map((r) => ({ value: r, label: r }))
          ]}
          value={resourceType}
          onChange={(e) => {
            setResourceType(e.target.value);
            setPage(1);
          }}
        />
      </Card>

      {log.loading ? (
        <Skeleton className="h-64" />
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ScrollText className="h-6 w-6" />}
            title="No entries"
            description="No audit events match the filters."
          />
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <AuditLogTable entries={rows} />
        </Card>
      )}

      {log.data && (
        <div className="flex items-center justify-between text-xs text-fg-muted">
          <span>
            Page {log.data.page} of {totalPages} · {log.data.total} entries
          </span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
