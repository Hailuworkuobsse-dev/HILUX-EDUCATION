import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Modal, Textarea } from '@/components/ui';
import { formatBirr } from '@/lib/currency';
import { refundSchema, type RefundValues } from '../schemas';

export interface RefundModalProps {
  open: boolean;
  onClose: () => void;
  orderAmount: number;
  onConfirm: (values: RefundValues) => Promise<void>;
  submitting?: boolean;
}

export function RefundModal({
  open,
  onClose,
  orderAmount,
  onConfirm,
  submitting
}: RefundModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<RefundValues>({ resolver: zodResolver(refundSchema) });

  useEffect(() => {
    if (open) reset({ reason: '', amount: orderAmount });
  }, [open, orderAmount, reset]);

  const submit = handleSubmit(async (v) => {
    await onConfirm(v);
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Refund order"
      description={`Order total: ${formatBirr(orderAmount)}. Leave amount blank for full refund.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={submit} loading={submitting || isSubmitting}>
            Issue refund
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-3">
        <Input
          label="Amount (optional)"
          type="number"
          min={0}
          max={orderAmount}
          placeholder={`${orderAmount}`}
          error={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />
        <Textarea
          label="Reason"
          rows={3}
          placeholder="Duplicate payment reported by user."
          error={errors.reason?.message}
          {...register('reason')}
        />
      </form>
    </Modal>
  );
}
