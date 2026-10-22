import { useState } from 'react';
import { CheckCircle2, ExternalLink, RefreshCcw, Undo2, XCircle } from 'lucide-react';
import { Badge, Button, Modal } from '@/components/ui';
import type { AdminOrder } from '@/types/admin';
import { formatBirr } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import { RefundModal } from './RefundModal';
import type { RefundValues } from '../schemas';

const STATUS_TONE: Record<AdminOrder['status'], 'success' | 'warning' | 'danger' | 'default' | 'info'> = {
  succeeded: 'success',
  pending: 'warning',
  processing: 'info',
  failed: 'danger',
  refunded: 'default'
};

export interface OrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  order: AdminOrder | null;
  onRefund: (values: RefundValues) => Promise<void>;
  onReconcile: () => Promise<void>;
  refunding?: boolean;
  reconciling?: boolean;
}

export function OrderDetailModal({
  open,
  onClose,
  order,
  onRefund,
  onReconcile,
  refunding,
  reconciling
}: OrderDetailModalProps) {
  const [refundOpen, setRefundOpen] = useState(false);
  if (!order) return null;

  const canRefund = order.status === 'succeeded' && !order.refundedAt;
  const canReconcile = order.status === 'pending' || order.status === 'processing';

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`Order ${order.id.slice(0, 8)}`}
        description={`${order.userName} · ${order.subjectName}`}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            {canReconcile && (
              <Button
                variant="secondary"
                leftIcon={<RefreshCcw className="h-4 w-4" />}
                onClick={onReconcile}
                loading={reconciling}
              >
                Reconcile
              </Button>
            )}
            {canRefund && (
              <Button
                variant="danger"
                leftIcon={<Undo2 className="h-4 w-4" />}
                onClick={() => setRefundOpen(true)}
              >
                Refund
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Status">
              <Badge tone={STATUS_TONE[order.status]}>
                {order.status === 'succeeded' ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : order.status === 'failed' ? (
                  <XCircle className="h-3 w-3" />
                ) : null}
                {order.status}
              </Badge>
            </Field>
            <Field label="Amount">{formatBirr(order.amount)}</Field>
            <Field label="Provider">
              <Badge tone="default">{order.provider}</Badge>
            </Field>
            <Field label="Reference">
              <span className="font-mono text-xs">{order.providerRef ?? '—'}</span>
            </Field>
            <Field label="Created">{formatDate(order.createdAt, 'PPp')}</Field>
            <Field label="Updated">{formatDate(order.updatedAt, 'PPp')}</Field>
            <Field label="User email">{order.userEmail}</Field>
            <Field label="Subject">{order.subjectName}</Field>
          </div>

          {order.refundedAt && (
            <div className="rounded-lg border border-border bg-bg-elevated/40 p-3 text-xs text-fg-muted">
              <span className="text-fg">Refunded</span> on {formatDate(order.refundedAt, 'PPp')}
            </div>
          )}

          {order.providerRef && (
            <a
              href={`#verify-${order.providerRef}`}
              onClick={(e) => e.preventDefault()}
              className="inline-flex items-center gap-1 text-xs text-brand-300 hover:underline"
            >
              View receipt <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </Modal>

      <RefundModal
        open={refundOpen}
        onClose={() => setRefundOpen(false)}
        orderAmount={order.amount}
        onConfirm={async (v) => {
          await onRefund(v);
          setRefundOpen(false);
        }}
        submitting={refunding}
      />
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-0.5 text-[10px] uppercase tracking-wide text-fg-muted">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}
