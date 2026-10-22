import { useQuery } from '@/hooks/useQuery';
import type { Mentee, MenteeDetail } from '@/types/mentor';
import { mentorApi, type ListMenteesQuery } from '../api';

export function useMentees(query: ListMenteesQuery = {}) {
  return useQuery<Mentee[]>(
    () => mentorApi.listMentees(query),
    [query.search, query.risk]
  );
}

export function useMentee(id: string | undefined) {
  return useQuery<MenteeDetail>(() => mentorApi.getMentee(id!), [id], !!id);
}
