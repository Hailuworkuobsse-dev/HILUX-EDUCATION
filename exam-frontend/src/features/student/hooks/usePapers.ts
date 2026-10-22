import { useQuery } from '@/hooks/useQuery';
import type { ExamPaper } from '@/types/exam';
import { studentApi } from '../api';

export function usePapers(subjectId?: string) {
  return useQuery<ExamPaper[]>(() => studentApi.listPapers(subjectId), [subjectId]);
}
