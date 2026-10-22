import { useQuery } from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import type { AdminOrder, AdminOrderFilter, AdminOrdersPage } from '@/types/admin';
import { adminApi, type RefundPayload } from '../api';

export function useAdminOrders(filter: AdminOrderFilter = {}) {
  return useQuery<AdminOrdersPage>(
    () => adminApi.listOrders(filter),
    [JSON.stringify(filter)]
  );
}

export function useAdminOrder(id: string | undefined) {
  return useQuery<AdminOrder>(() => adminApi.getOrder(id!), [id], !!id);
}

export function useRefundOrder(orderId: string) {
  return useMutation<AdminOrder, RefundPayload>((p) => adminApi.refundOrder(orderId, p));
}

export function useReconcileOrder() {
  return useMutation<AdminOrder, string>((id) => adminApi.reconcileOrder(id));
}
