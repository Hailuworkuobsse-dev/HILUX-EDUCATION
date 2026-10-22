import { useQuery } from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import type { Question } from '@/types/question';
import type {
  QuestionFilter,
  QuestionFormPayload,
  QuestionPage,
  ReviewDecision
} from '@/types/teacher';
import { teacherApi } from '../api';

export function useTeacherQuestions(filter: QuestionFilter = {}) {
  return useQuery<QuestionPage>(
    () => teacherApi.listQuestions(filter),
    [JSON.stringify(filter)]
  );
}

export function useTeacherQuestion(id: string | undefined) {
  return useQuery<Question>(() => teacherApi.getQuestion(id!), [id], !!id);
}

export function useCreateQuestion() {
  return useMutation<Question, QuestionFormPayload>((p) => teacherApi.createQuestion(p));
}

export function useUpdateQuestion(id: string) {
  return useMutation<Question, Partial<QuestionFormPayload>>((p) =>
    teacherApi.updateQuestion(id, p)
  );
}

export function useDeleteQuestion() {
  return useMutation<{ message: string }, string>((id) => teacherApi.deleteQuestion(id));
}

export function useQuestionAction() {
  const submit = useMutation<Question, string>((id) => teacherApi.submitQuestionReview(id));
  const review = useMutation<
    Question,
    { id: string; decision: ReviewDecision; reason?: string }
  >(({ id, decision, reason }) => teacherApi.reviewQuestion(id, decision, reason));
  const publish = useMutation<Question, string>((id) => teacherApi.publishQuestion(id));
  const archive = useMutation<Question, string>((id) => teacherApi.archiveQuestion(id));

  const act = async (
    id: string,
    action: 'submit-review' | 'approve' | 'reject' | 'publish' | 'archive',
    reason?: string
  ): Promise<Question> => {
    switch (action) {
      case 'submit-review':
        return submit.mutate(id);
      case 'approve':
        return review.mutate({ id, decision: 'approve' });
      case 'reject':
        return review.mutate({ id, decision: 'reject', reason: reason ?? '' });
      case 'publish':
        return publish.mutate(id);
      case 'archive':
        return archive.mutate(id);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  };

  return { act, loading: submit.loading || review.loading || publish.loading || archive.loading };
}

export function useReviewQueue(kind: 'questions' | 'papers') {
  return useQuery<Question[] | ExamPaper[]>(
    () => teacherApi.listReviewQueue(kind),
    [kind]
  );
}

import type { ExamPaper } from '@/types/exam';
