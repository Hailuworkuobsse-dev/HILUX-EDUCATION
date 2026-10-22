import { useQuery } from '@/hooks/useQuery';
import type { TeacherOverview } from '@/types/teacher';
import { teacherApi } from '../api';

export function useTeacherOverview() {
  return useQuery<TeacherOverview>(() => teacherApi.overview(), []);
}
