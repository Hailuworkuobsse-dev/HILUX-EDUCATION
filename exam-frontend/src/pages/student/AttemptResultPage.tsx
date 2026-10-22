import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Target, Trophy } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Progress,
  Skeleton
} from '@/components/ui';
import { ReviewQuestion } from '@/features/student/components';
import { useAttemptResult } from '@/features/student/hooks';
import { ROUTES } from '@/router/routes';

type Filter = 'all' | 'wrong' | 'skipped';

export default function AttemptResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const result = useAttemptResult(attemptId);
  const [filter, setFilter] = useState<Filter>('all');

  const data = result.data;

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.questionsWithAnswers.filter((q) => {
      if (filter === 'wrong') return !q.isCorrect && q.selectedOptionId;
      if (filter === 'skipped') return !q.selectedOptionId;
      return true;
    });
  }, [data, filter]);

  if (result.loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (result.error || !data) {
    return (
      <Card>
        <EmptyState
          icon={<Trophy className="h-6 w-6" />}
          title="Result unavailable"
          description="We couldn't load this result."
          action={
            <Button asChild>
              <Link to={ROUTES.STUDENT.RESULTS}>Back to results</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  const { attempt, breakdown } = data;
  const score = attempt.score ?? 0;
  const scoreTone = score >= 75 ? 'success' : score >= 50 ? 'warning' : 'danger';
  const scoreBg =
    scoreTone === 'success'
      ? 'from-emerald-500/20 to-transparent'
      : scoreTone === 'warning'
        ? 'from-amber-500/20 to-transparent'
        : 'from-rose-500/20 to-transparent';

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={ROUTES.STUDENT.RESULTS}
          className="mb-2 inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="h-3 w-3" /> All results
        </Link>
        <PageHeader
          title={attempt.title}
          description={`Submitted ${attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : ''}`}
          actions={
            <Button asChild variant="secondary" leftIcon={<RotateCcw className="h-4 w-4" />}>
              <Link to={`${ROUTES.STUDENT.PRACTICE}?subjectId=${attempt.subjectId}`}>
                Try another
              </Link>
            </Button>
          }
        />
      </div>

      <Card className={`overflow-hidden bg-gradient-to-br p-6 ${scoreBg}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Your score</p>
            <p className="mt-1 text-5xl font-extrabold">{score.toFixed(0)}%</p>
            <p className="mt-1 text-sm text-fg-muted">
              {attempt.correctCount ?? 0} of {attempt.totalQuestions} correct
            </p>
          </div>
          <div className="w-full max-w-xs">
            <Progress value={score} tone={scoreTone} size="md" />
            <p className="mt-2 text-xs text-fg-muted">
              {score >= 75 ? 'Excellent — keep going!' : score >= 50 ? 'Good — focus on weak topics.' : 'Review the explanations below.'}
            </p>
          </div>
        </div>
      </Card>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-brand-300" />
          <h2 className="text-base font-semibold">Topic breakdown</h2>
        </div>
        <Card className="divide-y divide-border p-0">
          {breakdown.length === 0 ? (
            <p className="p-4 text-sm text-fg-muted">No topic data.</p>
          ) : (
            breakdown.map((b) => {
              const pct = b.total > 0 ? (b.correct / b.total) * 100 : 0;
              return (
                <div key={b.topicId} className="flex items-center gap-3 p-3">
                  <p className="flex-1 truncate text-sm">{b.topicName}</p>
                  <div className="w-32">
                    <Progress value={pct} tone={pct >= 75 ? 'success' : pct >= 50 ? 'warning' : 'danger'} size="sm" />
                  </div>
                  <span className="w-12 text-right text-xs text-fg-muted">
                    {b.correct}/{b.total}
                  </span>
                </div>
              );
            })
          )}
        </Card>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Review answers</h2>
          <div className="flex gap-1">
            {(['all', 'wrong', 'skipped'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-2 py-1 text-xs font-medium capitalize ${
                  filter === f ? 'bg-brand-500/20 text-brand-200' : 'text-fg-muted hover:bg-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        {filtered.length === 0 ? (
          <Card className="p-6 text-center text-sm text-fg-muted">
            Nothing to show for this filter.
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((q) => (
              <ReviewQuestion
                key={q.id}
                index={data.questionsWithAnswers.findIndex((x) => x.id === q.id)}
                question={q}
              />
            ))}
          </div>
        )}
      </div>

      {filter === 'all' && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Answer key summary</p>
              <p className="text-xs text-fg-muted">
                Each question is shown with its correct answer and explanation.
              </p>
            </div>
            <div className="flex gap-2">
              <Badge tone="success">{attempt.correctCount ?? 0} correct</Badge>
              <Badge tone="danger">
                {attempt.totalQuestions - (attempt.correctCount ?? 0)} incorrect
              </Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
