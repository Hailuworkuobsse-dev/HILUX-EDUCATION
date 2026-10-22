import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  KeyRound,
  Mail,
  Phone,
  Shield,
  Users
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar, Badge, Button, Card, EmptyState, Skeleton } from '@/components/ui';
import {
  AuditLogTable,
  RoleChangeModal,
  SuspendUserModal,
  UserStatusBadge
} from '@/features/admin/components';
import {
  useAdminUser,
  useChangeRole,
  useChangeUserStatus,
  useResetUserPassword
} from '@/features/admin/hooks';
import type { ChangeRoleValues } from '@/features/admin/schemas';
import type { ChangeStatusValues } from '@/features/admin/schemas';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/lib/api';
import { formatDate } from '@/lib/date';
import { formatBirr } from '@/lib/currency';
import { ROLE_LABELS } from '@/lib/roles';
import { ROUTES } from '@/router/routes';

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const user = useAdminUser(userId);
  const changeRole = useChangeRole(userId ?? '');
  const changeStatus = useChangeUserStatus(userId ?? '');
  const resetPassword = useResetUserPassword();
  const toast = useToast();
  const navigate = useNavigate();

  const [roleOpen, setRoleOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  if (user.loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (user.error || !user.data) {
    return (
      <Card>
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="User not found"
          description="The account may have been deleted."
          action={
            <Button asChild>
              <Link to={ROUTES.ADMIN.USERS}>Back to users</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  const u = user.data;

  const handleRole = async (values: ChangeRoleValues) => {
    try {
      await changeRole.mutate(values);
      toast.success('Role updated');
      setRoleOpen(false);
      user.reload();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Update failed';
      toast.error('Update failed', msg);
    }
  };

  const handleStatus = async (values: ChangeStatusValues) => {
    try {
      await changeStatus.mutate(values);
      toast.success('Status updated');
      setStatusOpen(false);
      user.reload();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Update failed';
      toast.error('Update failed', msg);
    }
  };

  const handleResetPassword = async () => {
    if (!confirm(`Send a password reset email to ${u.email}?`)) return;
    try {
      await resetPassword.mutate(u.id);
      toast.success('Reset email sent');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not send reset email';
      toast.error('Action failed', msg);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={ROUTES.ADMIN.USERS}
          className="mb-2 inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="h-3 w-3" /> All users
        </Link>
        <PageHeader
          title={u.fullName}
          description={`Joined ${formatDate(u.createdAt, 'PP')}`}
          actions={
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                leftIcon={<Shield className="h-4 w-4" />}
                onClick={() => setRoleOpen(true)}
              >
                Change role
              </Button>
              <Button
                variant="secondary"
                leftIcon={<KeyRound className="h-4 w-4" />}
                onClick={handleResetPassword}
                loading={resetPassword.loading}
              >
                Reset password
              </Button>
              {u.status === 'active' ? (
                <Button
                  variant="danger"
                  leftIcon={<Ban className="h-4 w-4" />}
                  onClick={() => setStatusOpen(true)}
                >
                  Suspend
                </Button>
              ) : (
                <Button
                  variant="success"
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                  onClick={() => setStatusOpen(true)}
                >
                  Reactivate
                </Button>
              )}
            </div>
          }
        />
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar src={u.avatarUrl} name={u.fullName} size="lg" />
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{ROLE_LABELS[u.role]}</Badge>
            <UserStatusBadge status={u.status} />
            {u.verified && <Badge tone="success">Verified</Badge>}
          </div>
          <div className="ml-auto grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <p className="text-lg font-bold">{u.enrollments}</p>
              <p className="text-fg-muted">Enrollments</p>
            </div>
            <div>
              <p className="text-lg font-bold">{formatBirr(u.totalSpent)}</p>
              <p className="text-fg-muted">Spent</p>
            </div>
            <div>
              <p className="text-lg font-bold">
                {u.trialEndsAt && new Date(u.trialEndsAt).getTime() > Date.now() ? 'Yes' : 'No'}
              </p>
              <p className="text-fg-muted">On trial</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="p-4">
          <p className="mb-1 text-[10px] uppercase tracking-wide text-fg-muted">Email</p>
          <p className="flex items-center gap-2 text-sm">
            <Mail className="h-3.5 w-3.5 text-fg-muted" /> {u.email}
          </p>
        </Card>
        <Card className="p-4">
          <p className="mb-1 text-[10px] uppercase tracking-wide text-fg-muted">Phone</p>
          <p className="flex items-center gap-2 text-sm">
            <Phone className="h-3.5 w-3.5 text-fg-muted" /> {u.phone}
          </p>
        </Card>
      </div>

      {u.recentOrders.length > 0 && (
        <div>
          <h2 className="mb-3 text-base font-semibold">Recent orders</h2>
          <Card className="divide-y divide-border">
            {u.recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm">{o.subjectName}</p>
                  <p className="text-xs text-fg-muted">{formatDate(o.createdAt, 'MMM d, yyyy')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={o.status === 'succeeded' ? 'success' : 'warning'}>
                    {o.status}
                  </Badge>
                  <span className="text-xs font-medium">{formatBirr(o.amount)}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Recent activity</h2>
          <Button
            asChild
            variant="ghost"
            size="sm"
            onClick={() => navigate(`${ROUTES.ADMIN.AUDIT}?actorId=${u.id}`)}
          >
            <span>View full audit log</span>
          </Button>
        </div>
        {u.recentAuditLogs.length === 0 ? (
          <Card className="p-4 text-sm text-fg-muted">No activity recorded.</Card>
        ) : (
          <Card className="overflow-x-auto p-0">
            <AuditLogTable entries={u.recentAuditLogs} />
          </Card>
        )}
      </div>

      <RoleChangeModal
        open={roleOpen}
        onClose={() => setRoleOpen(false)}
        initial={u.role}
        onConfirm={handleRole}
        submitting={changeRole.loading}
      />
      <SuspendUserModal
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
        currentStatus={u.status}
        onConfirm={handleStatus}
        submitting={changeStatus.loading}
      />
    </div>
  );
}
