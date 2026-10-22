import { useQuery } from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import type {
  ContentFlag,
  ContentFlagResolution,
  ContentFlagStatus
} from '@/types/admin';
import { adminApi } from '../api';

export function useContentFlags(status?: ContentFlagStatus) {
  return useQuery<ContentFlag[]>(() => adminApi.listFlags(status), [status]);
}

export function useResolveFlag() {
  return useMutation<
    ContentFlag,
    { id: string; resolution: ContentFlagResolution; reason: string }
  >(({ id, resolution, reason }) => adminApi.resolveFlag(id, resolution, reason));
}
