import { useQuery } from '@/hooks/useQuery';
import type { MentorOverview } from '@/types/mentor';
import { mentorApi } from '../api';

export function useMentorOverview() {
  return useQuery<MentorOverview>(() => mentorApi.overview(), []);
}
