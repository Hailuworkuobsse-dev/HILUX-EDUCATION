import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal, Textarea } from '@/components/ui';
import { rejectReasonSchema, type RejectReasonValues } from '../schemas';

export interface RejectReasonModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
  submitting?: boolean;
}

export function RejectReasonModal({ open, onClose, onConfirm, submitting }: RejectReasonModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<RejectReasonValues>({ resolver: zodResolver(rejectReasonSchema) });

  useEffect(() => {
    if (open) reset({ reason: '' });
  }, [open, reset]);

  const submit = handleSubmit(async (v) => {
    await onConfirm(v.reason);
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reject submission"
      description="Explain what needs to change so the teacher can revise."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={submit} loading={submitting || isSubmitting}>
            Send rejection
          </Button>
        </>
      }
    >
      <form onSubmit={submit}>
        <Textarea
          label="Reason"
          rows={4}
          placeholder="e.g. Option B has a typo; explanation contradicts the answer."
          error={errors.reason?.message}
          {...register('reason')}
        />
      </form>
    </Modal>
  );
}
