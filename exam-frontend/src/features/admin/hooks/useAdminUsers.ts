import { useQuery } from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import type {
  AdminUser,
  AdminUserDetail,
  AdminUserFilter,
  AdminUsersPage
} from '@/types/admin';
import {
  adminApi,
  type ChangeRolePayload,
  type ChangeUserStatusPayload
} from '../api';

export function useAdminUsers(filter: AdminUserFilter = {}) {
  return useQuery<AdminUsersPage>(
    () => adminApi.listUsers(filter),
    [JSON.stringify(filter)]
  );
}

export function useAdminUser(id: string | undefined) {
  return useQuery<AdminUserDetail>(() => adminApi.getUser(id!), [id], !!id);
}

export function useChangeRole(userId: string) {
  return useMutation<AdminUser, ChangeRolePayload>((p) => adminApi.changeRole(userId, p));
}

export function useChangeUserStatus(userId: string) {
  return useMutation<AdminUser, ChangeUserStatusPayload>((p) =>
    adminApi.changeStatus(userId, p)
  );
}

export function useResetUserPassword() {
  return useMutation<{ message: string }, string>((id) => adminApi.resetPassword(id));
}
