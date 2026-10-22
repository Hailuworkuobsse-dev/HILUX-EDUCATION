import { useQuery } from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import type { ExamPaper } from '@/types/exam';
import type {
  PaperFilter,
  PaperFormPayload,
  ReviewDecision,
  TeacherPaperDetail
} from '@/types/teacher';
import { teacherApi } from '../api';

export function useTeacherPapers(filter: PaperFilter = {}) {
  return useQuery<ExamPaper[]>(
    () => teacherApi.listPapers(filter),
    [JSON.stringify(filter)]
  );
}

export function useTeacherPaper(id: string | undefined) {
  return useQuery<TeacherPaperDetail>(
    () => teacherApi.getPaper(id!),
    [id],
    !!id
  );
}

export function useCreatePaper() {
  return useMutation<ExamPaper, PaperFormPayload>((p) => teacherApi.createPaper(p));
}

export function useUpdatePaper(id: string) {
  return useMutation<ExamPaper, Partial<PaperFormPayload>>((p) =>
    teacherApi.updatePaper(id, p)
  );
}

export function useDeletePaper() {
  return useMutation<{ message: string }, string>((id) => teacherApi.deletePaper(id));
}

export function usePaperAction() {
  const submit = useMutation<ExamPaper, string>((id) => teacherApi.submitPaperReview(id));
  const approve = useMutation<ExamPaper, string>((id) => teacherApi.approvePaper(id));
  const reject = useMutation<ExamPaper, { id: string; reason: string }>(({ id, reason }) =>
    teacherApi.rejectPaper(id, reason)
  );
  const publish = useMutation<ExamPaper, string>((id) => teacherApi.publishPaper(id));
  const archive = useMutation<ExamPaper, string>((id) => teacherApi.archivePaper(id));

  const act = async (
    id: string,
    action: 'submit-review' | 'approve' | 'reject' | 'publish' | 'archive',
    reason?: string
  ): Promise<ExamPaper> => {
    switch (action) {
      case 'submit-review':
        return submit.mutate(id);
      case 'approve':
        return approve.mutate(id);
      case 'reject':
        return reject.mutate({ id, reason: reason ?? '' });
      case 'publish':
        return publish.mutate(id);
      case 'archive':
        return archive.mutate(id);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  };

  return {
    act,
    loading:
      submit.loading || approve.loading || reject.loading || publish.loading || archive.loading
  };
}

export type { ReviewDecision };
