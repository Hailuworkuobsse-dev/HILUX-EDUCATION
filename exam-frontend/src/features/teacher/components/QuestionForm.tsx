import { useEffect, useMemo, useRef } from 'react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, Textarea } from '@/components/ui';
import { SUBJECTS, DIFFICULTIES, LANGUAGES } from '@/lib/constants';
import type { Question } from '@/types/question';
import { useSubjects, useTopics } from '../hooks';
import { questionFormSchema, type QuestionFormValues } from '../schemas';
import { OptionsEditor } from './OptionsEditor';
import { QuestionPreview } from './QuestionPreview';

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const;
const LANG_LABELS: Record<string, string> = {
  en: 'English',
  am: 'Amharic',
  om: 'Afaan Oromo',
  ti: 'Tigrinya'
};

export interface QuestionFormProps {
  initial?: Question | null;
  submitting?: boolean;
  onSubmit: (values: QuestionFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

export function QuestionForm({ initial, submitting, onSubmit, onCancel }: QuestionFormProps) {
  const subjectsQuery = useSubjects();

  const defaults: QuestionFormValues = useMemo(() => {
    if (!initial) {
      return {
        subjectId: '',
        topicId: '',
        difficulty: 'medium',
        year: undefined,
        language: 'en',
        prompt: '',
        options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
        correctIndex: -1,
        explanation: ''
      };
    }
    return {
      subjectId: initial.subjectId,
      topicId: initial.topicId,
      difficulty: initial.difficulty,
      year: initial.year ?? undefined,
      language: initial.language,
      prompt: initial.prompt,
      options: initial.options.map((o) => ({ text: o.text })),
      correctIndex: initial.options.findIndex((o) => o.id === initial.correctOptionId),
      explanation: initial.explanation ?? ''
    };
  }, [initial]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: defaults
  });

  // Keep the form in sync when `initial` arrives asynchronously (edit mode).
  useEffect(() => {
    reset(defaults);
  }, [defaults, reset]);

  const subjectId = watch('subjectId');
  const topicsQuery = useTopics(subjectId || undefined);
  const prevSubjectRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevSubjectRef.current && prevSubjectRef.current !== subjectId) {
      setValue('topicId', '', { shouldValidate: true });
    }
    prevSubjectRef.current = subjectId;
  }, [subjectId, setValue]);

  // Derived preview options
  const { fields: optionFields } = useFieldArray({ control, name: 'options' });
  const watchedOptions = watch('options');
  const watchedCorrect = watch('correctIndex');
  const watchedPrompt = watch('prompt');
  const watchedExplanation = watch('explanation');

  const previewOptions = optionFields.map((_, i) => ({
    id: `opt-${i}`,
    label: LABELS[i] ?? '?',
    text: watchedOptions?.[i]?.text ?? ''
  }));
  const previewCorrectId = watchedCorrect >= 0 ? `opt-${watchedCorrect}` : undefined;

  const subjectOptions = useMemo(
    () =>
      subjectsQuery.data?.map((s) => ({ value: s.id, label: s.name })) ??
      SUBJECTS.map((s) => ({ value: s, label: s })),
    [subjectsQuery.data]
  );
  const topicOptions = useMemo(
    () => topicsQuery.data?.map((t) => ({ value: t.id, label: t.name })) ?? [],
    [topicsQuery.data]
  );

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form onSubmit={submitHandler} className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Select
                label="Subject"
                placeholder="Pick subject"
                options={subjectOptions}
                error={errors.subjectId?.message}
                {...register('subjectId')}
              />
              <Select
                label="Topic"
                placeholder={subjectId ? 'Pick topic' : 'Pick subject first'}
                options={topicOptions}
                disabled={!subjectId || topicsQuery.loading}
                error={errors.topicId?.message}
                {...register('topicId')}
              />
              <Select
                label="Difficulty"
                options={DIFFICULTIES.map((d) => ({ value: d, label: d }))}
                error={errors.difficulty?.message}
                {...register('difficulty')}
              />
              <Input
                label="Year (optional)"
                type="number"
                min={2000}
                max={2100}
                placeholder="2024"
                error={errors.year?.message}
                {...register('year', { valueAsNumber: true })}
              />
              <Select
                label="Language"
                options={LANGUAGES.map((l) => ({ value: l, label: LANG_LABELS[l] ?? l }))}
                error={errors.language?.message}
                {...register('language')}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                label="Prompt"
                placeholder="Write the question text…"
                rows={4}
                error={errors.prompt?.message}
                {...register('prompt')}
              />
              <div>
                <p className="mb-2 text-sm font-medium text-fg">
                  Options <span className="text-xs text-fg-muted">(mark the correct one)</span>
                </p>
                <OptionsEditor control={control} watch={watch} setValue={setValue} />
                {errors.correctIndex && (
                  <p className="mt-1 text-xs text-danger">{errors.correctIndex.message}</p>
                )}
                {errors.options && (
                  <p className="mt-1 text-xs text-danger">
                    {errors.options.message ?? 'Check your options'}
                  </p>
                )}
              </div>
              <Textarea
                label="Explanation (optional)"
                placeholder="Explain why the answer is correct…"
                rows={3}
                error={errors.explanation?.message}
                {...register('explanation')}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <QuestionPreview
            prompt={watchedPrompt}
            options={previewOptions}
            correctOptionId={previewCorrectId}
            explanation={watchedExplanation}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={submitting || isSubmitting} leftIcon={<Save className="h-4 w-4" />}>
          {initial ? 'Save changes' : 'Create question'}
        </Button>
      </div>
    </form>
  );
}
