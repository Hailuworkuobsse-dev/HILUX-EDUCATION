import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, EmptyState, Input, Select, Skeleton } from '@/components/ui';
import { UserTableRow } from '@/features/admin/components';
import { useAdminUsers } from '@/features/admin/hooks';
import { useDebounce } from '@/hooks/useDebounce';
import { ROLES, ROLE_LABELS } from '@/lib/roles';

const STATUSES = ['active', 'suspended', 'pending_verification'] as const;

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search, 300);
  const users = useAdminUsers({ search: debounced || undefined, role: (role || undefined) as never, status: (status || undefined) as never, page, pageSize: 25 });
  const totalPages = Math.max(1, users.data?.totalPages ?? 1);
  const rows = useMemo(() => users.data?.items ?? [], [users.data]);

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Search, filter, and manage every account on the platform." />
      <Card className="grid gap-3 p-3 sm:grid-cols-3">
        <Input placeholder="Search name, email, phone…" leftIcon={<Search className="h-4 w-4" />} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <Select options={[{ value: '', label: 'All roles' }, ...ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))]} value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} />
        <Select options={[{ value: '', label: 'All statuses' }, ...STATUSES.map((s) => ({ value: s, label: s }))]} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} />
      </Card>

      {users.loading ? <Skeleton className="h-64" /> : users.error ? (
        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div><p className="text-sm font-semibold">Users could not be loaded</p><p className="text-xs text-fg-muted">{users.error.message}</p></div>
          <Button variant="secondary" onClick={users.reload}>Retry</Button>
        </Card>
      ) : rows.length === 0 ? (
        <Card><EmptyState icon={<Users className="h-6 w-6" />} title="No users found" description="Try adjusting your search or filters." /></Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-[10px] uppercase tracking-wide text-fg-muted"><th className="py-2 pl-4 pr-2">User</th><th className="hidden px-2 sm:table-cell">Role</th><th className="px-2">Status</th><th className="hidden px-2 text-right md:table-cell">Enrollments</th><th className="hidden px-2 text-right md:table-cell">Spent</th><th className="hidden px-2 text-right sm:table-cell">Last active</th></tr></thead><tbody>{rows.map((u) => <UserTableRow key={u.id} user={u} />)}</tbody></table>
        </Card>
      )}

      {users.data && !users.error && (
        <div className="flex items-center justify-between text-xs text-fg-muted">
          <span>Page {users.data.page} of {totalPages} · {users.data.total} total</span>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" disabled={page <= 1 || users.loading} onClick={() => setPage((p) => Math.max(1, p - 1))} leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}>Prev</Button>
            <Button size="sm" variant="ghost" disabled={page >= totalPages || users.loading} onClick={() => setPage((p) => p + 1)} rightIcon={<ChevronRight className="h-3.5 w-3.5" />}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
