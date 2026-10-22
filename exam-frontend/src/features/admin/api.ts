import { api } from '@/lib/api';
import type { PaymentProvider } from '@/lib/constants';
import type { PaymentStatus } from '@/types/payment';
import type {
  AdminOrder,
  AdminOrderFilter,
  AdminOrdersPage,
  AdminUser,
  AdminUserDetail,
  AdminUserFilter,
  AdminUserStatus,
  AdminUsersPage,
  AuditLogEntry,
  AuditLogFilter,
  AuditLogPage,
  ContentFlag,
  ContentFlagResolution,
  ContentFlagStatus,
  PlatformStats
} from '@/types/admin';
import type { Role } from '@/lib/roles';

export interface ChangeRolePayload {
  role: Role;
  reason?: string;
}

export interface ChangeUserStatusPayload {
  status: AdminUserStatus;
  reason: string;
}

export interface RefundPayload {
  amount?: number;
  reason: string;
}

export const adminApi = {
  overview: () => api.get<PlatformStats>('/admin/overview'),

  listUsers: (filter: AdminUserFilter = {}) =>
    api.get<AdminUsersPage>('/admin/users', {
      query: {
        role: filter.role,
        status: filter.status,
        search: filter.search,
        page: filter.page,
        pageSize: filter.pageSize
      }
    }),
  getUser: (id: string) => api.get<AdminUserDetail>(`/admin/users/${id}`),
  changeRole: (id: string, payload: ChangeRolePayload) =>
    api.patch<AdminUser>(`/admin/users/${id}/role`, payload),
  changeStatus: (id: string, payload: ChangeUserStatusPayload) =>
    api.patch<AdminUser>(`/admin/users/${id}/status`, payload),
  resetPassword: (id: string) =>
    api.post<{ message: string }>(`/admin/users/${id}/reset-password`),

  listOrders: (filter: AdminOrderFilter = {}) =>
    api.get<AdminOrdersPage>('/admin/orders', {
      query: {
        status: filter.status,
        provider: filter.provider,
        search: filter.search,
        page: filter.page,
        pageSize: filter.pageSize
      }
    }),
  getOrder: (id: string) => api.get<AdminOrder>(`/admin/orders/${id}`),
  refundOrder: (id: string, payload: RefundPayload) =>
    api.post<AdminOrder>(`/admin/orders/${id}/refund`, payload),
  reconcileOrder: (id: string) =>
    api.post<AdminOrder>(`/admin/orders/${id}/reconcile`),

  listFlags: (status?: ContentFlagStatus) =>
    api.get<ContentFlag[]>('/admin/content/flags', { query: { status } }),
  resolveFlag: (
    id: string,
    resolution: ContentFlagResolution,
    reason: string
  ) =>
    api.post<ContentFlag>(`/admin/content/flags/${id}/resolve`, { resolution, reason }),

  listAudit: (filter: AuditLogFilter = {}) =>
    api.get<AuditLogPage>('/admin/audit', {
      query: {
        actorId: filter.actorId,
        action: filter.action,
        resourceType: filter.resourceType,
        search: filter.search,
        page: filter.page,
        pageSize: filter.pageSize
      }
    })
};

export type { PaymentProvider, PaymentStatus };
