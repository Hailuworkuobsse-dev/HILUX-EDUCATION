import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal, Select, Textarea } from '@/components/ui';
import { ROLES, ROLE_LABELS, type Role } from '@/lib/roles';
import { changeRoleSchema, type ChangeRoleValues } from '../schemas';

export interface RoleChangeModalProps {
  open: boolean;
  onClose: () => void;
  initial: Role;
  onConfirm: (values: ChangeRoleValues) => Promise<void>;
  submitting?: boolean;
}

export function RoleChangeModal({
  open,
  onClose,
  initial,
  onConfirm,
  submitting
}: RoleChangeModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ChangeRoleValues>({
    resolver: zodResolver(changeRoleSchema),
    defaultValues: { role: initial }
  });

  useEffect(() => {
    if (open) reset({ role: initial, reason: '' });
  }, [open, initial, reset]);

  const submit = handleSubmit(async (v) => {
    await onConfirm(v);
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change role"
      description="The user's dashboards and permissions update immediately."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={submitting || isSubmitting}>
            Save role
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-3">
        <Select
          label="New role"
          options={ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
          error={errors.role?.message}
          {...register('role')}
        />
        <Textarea
          label="Reason (audit log)"
          rows={3}
          placeholder="Promoted to mentor after vetting."
          error={errors.reason?.message}
          {...register('reason')}
        />
      </form>
    </Modal>
  );
}
