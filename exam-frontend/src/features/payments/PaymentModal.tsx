import { useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, Loader2, Smartphone, XCircle } from 'lucide-react';
import { Alert, Button, Modal, Spinner } from '@/components/ui';
import { useInterval } from '@/hooks/useInterval';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/lib/api';
import { formatBirr } from '@/lib/currency';
import { PAYMENT_PROVIDERS, type PaymentProvider } from '@/lib/constants';
import { useInitPayment, usePaymentStatus } from './hooks';
import type { PaymentInitResponse } from './api';

type Provider = Exclude<PaymentProvider, 'manual'>;

const PROVIDERS: { value: Provider; label: string; description: string; icon: typeof Smartphone }[] = [
  { value: 'telebirr', label: 'Telebirr', description: 'Mobile money by Ethio Telecom', icon: Smartphone },
  { value: 'cbe_birr', label: 'CBE Birr', description: 'Commercial Bank of Ethiopia', icon: Smartphone },
  { value: 'chapa', label: 'Chapa', description: 'Card & wallet checkout', icon: CreditCard }
];

export interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  subjectId: string;
  subjectName: string;
  amount: number;
  onSuccess: () => void;
}

export function PaymentModal({
  open,
  onClose,
  subjectId,
  subjectName,
  amount,
  onSuccess
}: PaymentModalProps) {
  const toast = useToast();
  const init = useInitPayment();
  const status = usePaymentStatus();
  const [provider, setProvider] = useState<Provider>('telebirr');
  const [initResult, setInitResult] = useState<PaymentInitResponse | null>(null);
  const [paid, setPaid] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  // Reset when opening
  useEffect(() => {
    if (open) {
      setInitResult(null);
      setPaid(false);
      setFailure(null);
    }
  }, [open]);

  // Poll for payment status
  useInterval(
    async () => {
      if (!initResult || paid) return;
      try {
        const res = await status.mutate(initResult.orderId);
        if (res.status === 'succeeded') {
          setPaid(true);
          toast.success('Payment received!');
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1200);
        } else if (res.status === 'failed') {
          setFailure(res.failureReason ?? 'Payment failed');
        }
      } catch {
        /* silent; retry next tick */
      }
    },
    initResult && !paid ? 3000 : null
  );

  const startPayment = async () => {
    setFailure(null);
    try {
      const res = await init.mutate({ subjectId, provider });
      setInitResult(res);
      if (provider === 'chapa' && res.checkoutUrl) {
        window.open(res.checkoutUrl, '_blank', 'noopener');
      }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not start payment';
      toast.error('Payment failed', msg);
    }
  };

  const heading = paid
    ? 'Payment confirmed'
    : initResult
      ? 'Complete your payment'
      : 'Choose payment method';

  return (
    <Modal
      open={open}
      onClose={paid ? onClose : () => !initResult && onClose()}
      title={heading}
      description={`${subjectName} · ${formatBirr(amount)}`}
      footer={
        paid ? (
          <Button onClick={onClose} leftIcon={<CheckCircle2 className="h-4 w-4" />}>
            Done
          </Button>
        ) : initResult ? (
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={startPayment} loading={init.loading}>
              Continue with {PROVIDERS.find((p) => p.value === provider)?.label}
            </Button>
          </>
        )
      }
    >
      {paid ? (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <p className="text-sm text-fg-muted">
            Your subscription is now active. Happy practicing!
          </p>
        </div>
      ) : initResult ? (
        <div className="space-y-3">
          {failure && (
            <Alert tone="danger" title="Payment failed">
              {failure}
            </Alert>
          )}
          {initResult.instructions && (
            <Alert tone="info" title="Instructions">
              <div className="whitespace-pre-wrap text-sm">{initResult.instructions}</div>
            </Alert>
          )}
          {initResult.checkoutUrl && (
            <Alert tone="info" title="Finish in the new tab">
              We opened a secure checkout page. Complete the payment there and we&apos;ll update
              your account automatically.
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(initResult.checkoutUrl, '_blank', 'noopener')}
                >
                  Reopen checkout
                </Button>
              </div>
            </Alert>
          )}
          <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-bg-elevated/40 py-3 text-sm text-fg-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Waiting for payment confirmation…
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {PROVIDERS.filter((p) => PAYMENT_PROVIDERS.includes(p.value)).map((p) => {
            const Icon = p.icon;
            const active = provider === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setProvider(p.value)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                  active
                    ? 'border-brand-400 bg-brand-500/10'
                    : 'border-border bg-bg-surface/60 hover:border-brand-500/50'
                }`}
                aria-pressed={active}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    active ? 'bg-brand-500/20 text-brand-200' : 'bg-white/5 text-fg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{p.label}</p>
                  <p className="text-xs text-fg-muted">{p.description}</p>
                </div>
                {active && <CheckCircle2 className="h-4 w-4 text-brand-300" />}
              </button>
            );
          })}
          {status.loading && (
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-fg-muted">
              <Spinner className="h-4 w-4" /> Checking…
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
