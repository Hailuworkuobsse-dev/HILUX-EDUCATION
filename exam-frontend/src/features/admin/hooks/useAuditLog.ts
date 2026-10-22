import { useQuery } from '@/hooks/useQuery';
import type { AuditLogFilter, AuditLogPage } from '@/types/admin';
import { adminApi } from '../api';

export function useAuditLog(filter: AuditLogFilter = {}) {
  return useQuery<AuditLogPage>(
    () => adminApi.listAudit(filter),
    [JSON.stringify(filter)]
  );
}
