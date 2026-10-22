import { useQuery } from '@/hooks/useQuery';
import type { MentorThread } from '@/types/mentor';
import { mentorApi } from '../api';

export function useThreads() {
  return useQuery<MentorThread[]>(() => mentorApi.listThreads(), []);
}
