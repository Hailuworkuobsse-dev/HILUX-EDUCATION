import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  Skeleton,
  Textarea
} from '@/components/ui';
import {
  PaperQuestionList,
  QuestionPickerModal
} from '@/features/teacher/components';
import {
  useCreatePaper,
  useSubjects,
  useTeacherPaper,
  useUpdatePaper
} from '@/features/teacher/hooks';
import { paperFormSchema, type PaperFormValues } from '@/features/teacher/schemas';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/lib/api';
import { DIFFICULTIES, LANGUAGES } from '@/lib/constants';
import { ROUTES } from '@/router/routes';
import type { Question } from '@/types/question';

const LANG_LABELS: Record<string, string> = {
  en: 'English',
  am: 'Amharic',
  om: 'Afaan Oromo',
  ti: 'Tigrinya'
};

export default function PaperFormPage() {
  const { paperId } = useParams<{ paperId: string }>();
  const isEdit = !!paperId;
  const navigate = useNavigate();
  const toast = useToast();
  const subjects = useSubjects();
  const existing = useTeacherPaper(paperId);
  const create = useCreatePaper();
  const update = useUpdatePaper(paperId ?? '');

  const [pickerOpen, setPickerOpen] = useState(false);

  const defaults: PaperFormValues = useMemo(() => {
    const base: PaperFormValues = {
      title: '',
      subjectId: '',
      year: new Date().getFullYear(),
      durationMinutes: 60,
      difficulty: 'medium',
      language: 'en',
      description: '',
      questions: []
    };
    if (existing.data) {
      return {
        ...base,
        title: existing.data.title,
        subjectId: existing.data.subjectId,
        year: existing.data.year,
        durationMinutes: existing.data.durationMinutes,
        difficulty: existing.data.difficulty,
        language: existing.data.language,
        questions: existing.data.questions.map((q) => ({
          questionId: q.id,
          prompt: q.prompt,
          difficulty: q.difficulty
        }))
      };
    }
    return base;
  }, [existing.data]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<PaperFormValues>({
    resolver: zodResolver(paperFormSchema),
    defaultValues: defaults
  });

  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const subjectId = watch('subjectId');
  const questions = watch('questions');

  const subjectOptions = useMemo(
    () => subjects.data?.map((s) => ({ value: s.id, label: s.name })) ?? [],
    [subjects.data]
  );

  const handlePicked = (picked: Question[]) => {
    const existingIds = new Set(questions.map((q) => q.questionId));
    const next = picked
      .filter((q) => !existingIds.has(q.id))
      .map((q) => ({ questionId: q.id, prompt: q.prompt, difficulty: q.difficulty }));
    setValue('questions', [...questions, ...next], { shouldValidate: true });
  };

  const submitHandler = handleSubmit(async (values) => {
    if (!subjectId) {
      toast.error('Pick a subject first');
      return;
    }
    const payload = {
      title: values.title,
      subjectId: values.subjectId,
      year: values.year as number,
      durationMinutes: values.durationMinutes as number,
      difficulty: values.difficulty,
      language: values.language,
      description: values.description || undefined,
      questionIds: values.questions.map((q) => q.questionId)
    };
    try {
      if (isEdit) {
        await update.mutate(payload);
        toast.success('Paper updated');
        navigate(ROUTES.TEACHER.PAPER_DETAIL.replace(':paperId', paperId));
      } else {
        const created = await create.mutate(payload);
        toast.success('Paper created');
        navigate(ROUTES.TEACHER.PAPER_DETAIL.replace(':paperId', created.id));
      }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Save failed';
      toast.error('Save failed', msg);
    }
  });

  if (isEdit && existing.error) {
    return (
      <Card className="space-y-3 p-5">
        <p className="font-semibold">Unable to load this paper for editing.</p>
        <p className="text-sm text-fg-muted">The form is not safe to edit until the existing paper has loaded.</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={existing.reload}>Retry</Button>
          <Button variant="ghost" onClick={() => navigate(ROUTES.TEACHER.PAPERS)}>Back to papers</Button>
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
        title={isEdit ? 'Edit paper' : 'New paper'}
        description={isEdit ? 'Update this paper. It returns to draft.' : 'Create a new exam paper.'}
        actions={
          <Button
            type="button"
            onClick={submitHandler}
            loading={create.loading || update.loading || isSubmitting}
            leftIcon={<Save className="h-4 w-4" />}
          >
            {isEdit ? 'Save changes' : 'Create paper'}
          </Button>
        }
      />

      {subjects.error && (
        <Alert tone="warning" title="Subjects could not be loaded">
          Choose a valid subject only after the subject list has loaded.
          <Button className="mt-2" size="sm" variant="secondary" onClick={subjects.reload}>Retry</Button>
        </Alert>
      )}

      <form onSubmit={submitHandler} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Paper details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Title"
              placeholder="Grade 10 Math — 2023 paper"
              error={errors.title?.message}
              {...register('title')}
            />
            <Select
              label="Subject"
              placeholder="Pick subject"
              options={subjectOptions}
              error={errors.subjectId?.message}
              {...register('subjectId')}
            />
            <Input
              label="Year"
              type="number"
              min={2000}
              max={2100}
              error={errors.year?.message}
              {...register('year', { valueAsNumber: true })}
            />
            <Input
              label="Duration (minutes)"
              type="number"
              min={5}
              max={300}
              error={errors.durationMinutes?.message}
              {...register('durationMinutes', { valueAsNumber: true })}
            />
            <Select
              label="Difficulty"
              options={DIFFICULTIES.map((d) => ({ value: d, label: d }))}
              error={errors.difficulty?.message}
              {...register('difficulty')}
            />
            <Select
              label="Language"
              options={LANGUAGES.map((l) => ({ value: l, label: LANG_LABELS[l] ?? l }))}
              error={errors.language?.message}
              {...register('language')}
            />
            <div className="sm:col-span-2">
              <Textarea
                label="Description (optional)"
                rows={3}
                placeholder="Notes about this paper…"
                error={errors.description?.message}
                {...register('description')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions ({questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {!subjectId && (
              <Alert tone="info" className="mb-3">
                Pick a subject above to add questions from the bank.
              </Alert>
            )}
            <PaperQuestionList
              control={control}
              onAddClick={() => {
                if (!subjectId) {
                  toast.error('Pick a subject first');
                  return;
                }
                setPickerOpen(true);
              }}
            />
            {errors.questions && (
              <p className="mt-2 text-xs text-danger">{errors.questions.message}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            loading={create.loading || update.loading || isSubmitting}
            leftIcon={<Save className="h-4 w-4" />}
          >
            {isEdit ? 'Save changes' : 'Create paper'}
          </Button>
        </div>
      </form>

      <QuestionPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        subjectId={subjectId}
        excludeIds={questions.map((q) => q.questionId)}
        onPick={handlePicked}
      />
    </div>
  );
}
