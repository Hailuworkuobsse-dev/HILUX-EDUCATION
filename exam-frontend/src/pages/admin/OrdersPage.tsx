import { useMemo, useState } from 'react';
import { Banknote, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Button, Card, EmptyState, Input, Select, Skeleton } from '@/components/ui';
import { OrderDetailModal } from '@/features/admin/components';
import {
  useAdminOrders,
  useReconcileOrder,
  useRefundOrder
} from '@/features/admin/hooks';
import type { RefundValues } from '@/features/admin/schemas';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/lib/api';
import { PAYMENT_PROVIDERS } from '@/lib/constants';
import { formatBirr } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import type { AdminOrder } from '@/types/admin';

const STATUSES = ['pending', 'processing', 'succeeded', 'failed', 'refunded'] as const;

const STATUS_TONE: Record<AdminOrder['status'], 'success' | 'warning' | 'danger' | 'default' | 'info'> = {
  succeeded: 'success',
  pending: 'warning',
  processing: 'info',
  failed: 'danger',
  refunded: 'default'
};

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [provider, setProvider] = useState('');
  const [page, setPage] = useState(1);
  const [activeOrder, setActiveOrder] = useState<AdminOrder | null>(null);
  const debounced = useDebounce(search, 300);

  const orders = useAdminOrders({
    search: debounced || undefined,
    status: (status || undefined) as never,
    provider: (provider || undefined) as never,
    page,
    pageSize: 25
  });

  const refund = useRefundOrder(activeOrder?.id ?? '');
  const reconcile = useReconcileOrder();
  const toast = useToast();

  const totalPages = orders.data?.totalPages ?? 1;
  const rows = useMemo(() => orders.data?.items ?? [], [orders.data]);

  const handleRefund = async (values: RefundValues) => {
    if (!activeOrder) return;
    try {
      await refund.mutate(values);
      toast.success('Refund issued');
      setActiveOrder(null);
      orders.reload();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Refund failed';
      toast.error('Refund failed', msg);
    }
  };

  const handleReconcile = async () => {
    if (!activeOrder) return;
    try {
      const updated = await reconcile.mutate(activeOrder.id);
      setActiveOrder(updated);
      toast.success('Order reconciled');
      orders.reload();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Reconcile failed';
      toast.error('Reconcile failed', msg);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders & payments"
        description="Track revenue and reconcile payments across providers."
      />

      <Card className="grid gap-3 p-3 sm:grid-cols-3">
        <Input
          placeholder="Search by user or subject…"
          leftIcon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Select
          options={[
            { value: '', label: 'All statuses' },
            ...STATUSES.map((s) => ({ value: s, label: s }))
          ]}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        />
        <Select
          options={[
            { value: '', label: 'All providers' },
            ...PAYMENT_PROVIDERS.map((p) => ({ value: p, label: p }))
          ]}
          value={provider}
          onChange={(e) => {
            setProvider(e.target.value);
            setPage(1);
          }}
        />
      </Card>

      {orders.loading ? (
        <Skeleton className="h-64" />
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Banknote className="h-6 w-6" />}
            title="No orders"
            description="Try adjusting your filters."
          />
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-wide text-fg-muted">
                <th className="py-2 pl-4 pr-2">User</th>
                <th className="hidden px-2 sm:table-cell">Subject</th>
                <th className="px-2">Status</th>
                <th className="hidden px-2 md:table-cell">Provider</th>
                <th className="px-2 text-right">Amount</th>
                <th className="hidden px-2 pr-4 text-right sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setActiveOrder(o)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="py-2 pl-4 pr-2">
                    <p className="truncate text-sm font-medium">{o.userName}</p>
                    <p className="truncate text-xs text-fg-muted">{o.userEmail}</p>
                  </td>
                  <td className="hidden px-2 text-xs sm:table-cell">{o.subjectName}</td>
                  <td className="px-2">
                    <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge>
                  </td>
                  <td className="hidden px-2 text-xs md:table-cell">{o.provider}</td>
                  <td className="px-2 text-right text-xs font-medium">{formatBirr(o.amount)}</td>
                  <td className="hidden px-2 pr-4 text-right text-xs sm:table-cell">
                    {formatDate(o.createdAt, 'MMM d')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {orders.data && (
        <div className="flex items-center justify-between text-xs text-fg-muted">
          <span>
            Page {orders.data.page} of {totalPages} · {orders.data.total} orders
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

      <OrderDetailModal
        open={!!activeOrder}
        onClose={() => setActiveOrder(null)}
        order={activeOrder}
        onRefund={handleRefund}
        onReconcile={handleReconcile}
        refunding={refund.loading}
        reconciling={reconcile.loading}
      />
    </div>
  );
}
