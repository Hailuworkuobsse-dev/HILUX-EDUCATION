import { useQuery } from '@/hooks/useQuery';
import type { Subject, Topic } from '@/types/exam';
import { teacherApi } from '../api';

export function useSubjects() {
  return useQuery<Subject[]>(() => teacherApi.listSubjects(), []);
}

export function useTopics(subjectId: string | undefined) {
  return useQuery<Topic[]>(
    () => teacherApi.listTopics(subjectId!),
    [subjectId],
    !!subjectId
  );
}
