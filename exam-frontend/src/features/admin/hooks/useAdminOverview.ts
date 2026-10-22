import { useQuery } from '@/hooks/useQuery';
import type { PlatformStats } from '@/types/admin';
import { adminApi } from '../api';

export function useAdminOverview() {
  return useQuery<PlatformStats>(() => adminApi.overview(), []);
}
