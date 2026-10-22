import { useQuery } from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import { studentApi, type CourseDetail, type CourseSummary } from '../api';

export function useCourses() {
  return useQuery<CourseSummary[]>(() => studentApi.listCourses(), []);
}

export function useCourse(subjectId: string | undefined) {
  return useQuery<CourseDetail>(
    () => studentApi.getCourse(subjectId!),
    [subjectId],
    !!subjectId
  );
}

export function useEnrollCourse() {
  return useMutation<Awaited<ReturnType<typeof studentApi.enroll>>, string>((subjectId) =>
    studentApi.enroll(subjectId)
  );
}
