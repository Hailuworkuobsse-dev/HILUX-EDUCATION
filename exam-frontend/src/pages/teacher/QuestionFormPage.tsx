import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, Skeleton } from '@/components/ui';
import { QuestionForm } from '@/features/teacher/components';
import {
  useCreateQuestion,
  useTeacherQuestion,
  useUpdateQuestion
} from '@/features/teacher/hooks';
import type { QuestionFormValues } from '@/features/teacher/schemas';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/lib/api';
import { ROUTES } from '@/router/routes';

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const;

export default function QuestionFormPage() {
  const { questionId } = useParams<{ questionId: string }>();
  const isEdit = !!questionId;
  const navigate = useNavigate();
  const toast = useToast();
  const existing = useTeacherQuestion(questionId);
  const create = useCreateQuestion();
  const update = useUpdateQuestion(questionId ?? '');

  const handleSubmit = async (values: QuestionFormValues) => {
    const options = values.options.map((o, i) => ({
      id: `opt-${i + 1}`,
      label: LABELS[i],
      text: o.text
    }));
    const correctOptionId = options[values.correctIndex]?.id;
    if (!correctOptionId) {
      toast.error('Mark the correct answer');
      return;
    }
    const payload = {
      subjectId: values.subjectId,
      topicId: values.topicId,
      difficulty: values.difficulty,
      year: values.year,
      language: values.language,
      prompt: values.prompt,
      options,
      correctOptionId,
      explanation: values.explanation || undefined
    };
    try {
      if (isEdit) {
        await update.mutate(payload);
        toast.success('Question updated');
        navigate(ROUTES.TEACHER.QUESTION_DETAIL.replace(':questionId', questionId));
      } else {
        const created = await create.mutate(payload);
        toast.success('Question created as draft');
        navigate(ROUTES.TEACHER.QUESTION_DETAIL.replace(':questionId', created.id));
      }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Save failed';
      toast.error('Save failed', msg);
    }
  };

  if (isEdit && existing.error) {
    return (
      <Card className="space-y-3 p-5">
        <p className="font-semibold">Unable to load this question for editing.</p>
        <p className="text-sm text-fg-muted">The form is not safe to edit until the existing question has loaded.</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={existing.reload}>Retry</Button>
          <Button variant="ghost" onClick={() => navigate(ROUTES.TEACHER.QUESTIONS)}>Back to question bank</Button>
        </div>
      </Card>
    );
  }

  if (isEdit && existing.loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit question' : 'New question'}
        description={
          isEdit
            ? 'Update the question. Saved changes return it to draft.'
            : 'Author a new MCQ. Save as draft, then submit for review.'
        }
      />
      <QuestionForm
        initial={existing.data ?? null}
        submitting={create.loading || update.loading}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
}
