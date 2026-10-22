import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  RefreshCcw,
  TrendingUp,
  UserPlus,
  Users
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Button, Card, EmptyState, Skeleton } from '@/components/ui';
import { StatCard } from '@/features/student/components/StatCard';
import { useAdminOverview, useAdminOrders, useAdminUsers, useContentFlags } from '@/features/admin/hooks';
import { formatBirr } from '@/lib/currency';
import { formatRelative } from '@/lib/date';
import { ROUTES } from '@/router/routes';

export default function AdminDashboard() {
  const overview = useAdminOverview();
  const recentOrders = useAdminOrders({ pageSize: 5 });
  const recentUsers = useAdminUsers({ pageSize: 5 });
  const openFlags = useContentFlags('open');

  const data = overview.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin control panel"
        description="Platform health, users, revenue, and content moderation."
      />

      {overview.loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total users"
            value={data?.totalUsers ?? 0}
            icon={Users}
            tone="brand"
            hint={`+${data?.newUsersThisWeek ?? 0} this week`}
          />
          <StatCard
            label="Active subscriptions"
            value={data?.activeSubscriptions ?? 0}
            icon={TrendingUp}
            tone="success"
            hint={`${data?.trialingUsers ?? 0} on trial`}
          />
          <StatCard
            label="Revenue this month"
            value={formatBirr(data?.revenueThisMonth ?? 0)}
            icon={Banknote}
            tone="accent"
            hint={`MRR ${formatBirr(data?.mrr ?? 0)}`}
          />
          <StatCard
            label="Needs attention"
            value={(data?.ordersPending ?? 0) + (data?.openFlags ?? 0)}
            icon={AlertTriangle}
            tone="warning"
            hint={`${data?.ordersPending ?? 0} pending · ${data?.openFlags ?? 0} flags`}
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent orders</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.ADMIN.ORDERS}>
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
          {recentOrders.loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : recentOrders.data && recentOrders.data.items.length > 0 ? (
            <Card className="divide-y divide-border">
              {recentOrders.data.items.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{o.userName}</p>
                    <p className="truncate text-xs text-fg-muted">{o.subjectName}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      tone={
                        o.status === 'succeeded'
                          ? 'success'
                          : o.status === 'failed'
                            ? 'danger'
                            : 'warning'
                      }
                    >
                      {o.status}
                    </Badge>
                    <span className="text-xs font-medium">{formatBirr(o.amount)}</span>
                  </div>
                </div>
              ))}
            </Card>
          ) : (
            <Card>
              <EmptyState
                icon={<RefreshCcw className="h-6 w-6" />}
                title="No orders yet"
                description="Payment activity will appear here."
              />
            </Card>
          )}

          {(data?.openFlags ?? 0) > 0 && (
            <Card className="border-warning/30 bg-warning/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 text-warning">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{data?.openFlags} content flags</p>
                    <p className="text-xs text-fg-muted">
                      Questions students reported that need review.
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link to={ROUTES.ADMIN.CONTENT}>Review now</Link>
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">New users</h2>
              <Button asChild variant="ghost" size="sm">
                <Link to={ROUTES.ADMIN.USERS}>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
            {recentUsers.loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : recentUsers.data && recentUsers.data.items.length > 0 ? (
              <Card className="divide-y divide-border">
                {recentUsers.data.items.slice(0, 5).map((u) => (
                  <Link
                    key={u.id}
                    to={ROUTES.ADMIN.USER_DETAIL.replace(':userId', u.id)}
                    className="block p-3 hover:bg-white/[0.02]"
                  >
                    <p className="truncate text-sm font-medium">{u.fullName}</p>
                    <p className="text-xs text-fg-muted">
                      {u.role} · {formatRelative(u.createdAt)}
                    </p>
                  </Link>
                ))}
              </Card>
            ) : (
              <Card>
                <EmptyState
                  icon={<UserPlus className="h-6 w-6" />}
                  title="No new users"
                  description="You're all caught up."
                />
              </Card>
            )}
          </div>

          {openFlags.data && openFlags.data.length > 0 && (
            <Card className="p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fg-muted">
                Top flags
              </p>
              <div className="space-y-2">
                {openFlags.data.slice(0, 3).map((f) => (
                  <div key={f.id} className="rounded-lg border border-border bg-bg-elevated/40 p-2">
                    <p className="line-clamp-1 text-xs">{f.questionPrompt}</p>
                    <p className="mt-0.5 text-[10px] text-fg-subtle">
                      {f.reason} · {formatRelative(f.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
