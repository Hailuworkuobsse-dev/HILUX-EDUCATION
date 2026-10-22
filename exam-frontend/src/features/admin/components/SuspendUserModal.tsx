import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal, Select, Textarea } from '@/components/ui';
import { changeStatusSchema, type ChangeStatusValues } from '../schemas';

export interface SuspendUserModalProps {
  open: boolean;
  onClose: () => void;
  currentStatus: 'active' | 'suspended' | 'pending_verification';
  onConfirm: (values: ChangeStatusValues) => Promise<void>;
  submitting?: boolean;
}

export function SuspendUserModal({
  open,
  onClose,
  currentStatus,
  onConfirm,
  submitting
}: SuspendUserModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ChangeStatusValues>({
    resolver: zodResolver(changeStatusSchema),
    defaultValues: { status: currentStatus }
  });

  useEffect(() => {
    if (open) reset({ status: currentStatus, reason: '' });
  }, [open, currentStatus, reset]);

  const submit = handleSubmit(async (v) => {
    await onConfirm(v);
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change account status"
      description="Suspending prevents sign-in. Reason is logged for audit."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={currentStatus === 'active' ? 'danger' : 'primary'}
            onClick={submit}
            loading={submitting || isSubmitting}
          >
            Save status
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-3">
        <Select
          label="Status"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'suspended', label: 'Suspended' },
            { value: 'pending_verification', label: 'Pending verification' }
          ]}
          error={errors.status?.message}
          {...register('status')}
        />
        <Textarea
          label="Reason"
          rows={3}
          placeholder="Suspended for sharing exam answers."
          error={errors.reason?.message}
          {...register('reason')}
        />
      </form>
    </Modal>
  );
}
