import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Flame,
  PlayCircle,
  Target,
  Trophy,
  Zap
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, EmptyState, Skeleton } from '@/components/ui';
import {
  AttemptListItem,
  StatCard,
  TrialBanner
} from '@/features/student/components';
import {
  useAttempts,
  useDueReviews,
  useStudentOverview
} from '@/features/student/hooks';
import { ROUTES } from '@/router/routes';

export default function StudentDashboard() {
  const overview = useStudentOverview();
  const inProgress = useAttempts({ status: 'in_progress', limit: 1 });
  const recent = useAttempts({ status: 'graded', limit: 5 });
  const due = useDueReviews();

  const stats = overview.data;
  const continueAttempt = inProgress.data?.[0];
  const dueCount = due.data?.length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your practice hub"
        description="Keep your streak alive — one paper at a time."
        actions={
          <Button asChild leftIcon={<PlayCircle className="h-4 w-4" />}>
            <Link to={ROUTES.STUDENT.PRACTICE}>Start practice</Link>
          </Button>
        }
      />

      <TrialBanner />

      {overview.loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : overview.error ? (
        <Card className="p-5">
          <p className="font-semibold">Your performance could not be loaded.</p>
          <p className="mt-1 text-sm text-fg-muted">Your scores have not been replaced with zeros. Check your connection and try again.</p>
          <Button className="mt-3" variant="secondary" onClick={overview.reload}>Retry</Button>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Overall accuracy"
            value={`${stats?.overallAccuracy.toFixed(0) ?? 0}%`}
            icon={Target}
            tone="brand"
            hint={`${stats?.totalQuestionsAnswered ?? 0} questions answered`}
          />
          <StatCard
            label="Streak"
            value={`${stats?.streakDays ?? 0} days`}
            icon={Flame}
            tone="warning"
            hint="Keep it going!"
          />
          <StatCard
            label="Attempts"
            value={stats?.totalAttempts ?? 0}
            icon={Trophy}
            tone="accent"
            hint={`Avg score: ${stats?.averageScore.toFixed(0) ?? 0}%`}
          />
          <StatCard
            label="Due reviews"
            value={dueCount}
            icon={Zap}
            tone="success"
            hint={dueCount > 0 ? 'Review now to lock it in' : 'All caught up'}
          />
        </div>
      )}

      {due.error && (
        <Card className="p-4">
          <p className="text-sm text-fg-muted">Your review queue could not be loaded.</p>
          <Button className="mt-2" size="sm" variant="secondary" onClick={due.reload}>Retry</Button>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {continueAttempt && (
            <Card className="border-brand-500/30 bg-brand-500/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-300">
                    In progress
                  </p>
                  <p className="mt-1 text-base font-semibold">{continueAttempt.title}</p>
                  <p className="text-xs text-fg-muted">
                    {continueAttempt.answers.filter((a) => a.selectedOptionId).length} of{' '}
                    {continueAttempt.totalQuestions} answered
                  </p>
                </div>
                <Button asChild rightIcon={<ArrowRight className="h-4 w-4" />}>
                  <Link
                    to={ROUTES.STUDENT.ATTEMPT.replace(':attemptId', continueAttempt.id)}
                  >
                    Continue
                  </Link>
                </Button>
              </div>
            </Card>
          )}

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Recent attempts</h2>
              <Button asChild variant="ghost" size="sm">
                <Link to={ROUTES.STUDENT.RESULTS}>View all</Link>
              </Button>
            </div>
            {recent.loading ? (
              <div className="space-y-2">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : recent.error ? (
              <Card className="p-4">
                <p className="text-sm text-fg-muted">Recent attempts could not be loaded.</p>
                <Button className="mt-2" size="sm" variant="secondary" onClick={recent.reload}>Retry</Button>
              </Card>
            ) : recent.data && recent.data.length > 0 ? (
              <div className="space-y-2">
                {recent.data.map((a) => (
                  <AttemptListItem key={a.id} attempt={a} />
                ))}
              </div>
            ) : (
              <Card>
                <EmptyState
                  icon={<Trophy className="h-6 w-6" />}
                  title="No attempts yet"
                  description="Start your first practice paper to see results here."
                  action={
                    <Button asChild>
                      <Link to={ROUTES.STUDENT.PRACTICE}>Start now</Link>
                    </Button>
                  }
                />
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {dueCount > 0 && (
            <Card className="border-success/30 bg-success/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                Spaced review
              </p>
              <p className="mt-1 text-2xl font-bold">{dueCount}</p>
              <p className="text-xs text-fg-muted">
                questions ready for review to lock in your memory.
              </p>
              <Button asChild size="sm" className="mt-4" fullWidth>
                <Link to={`${ROUTES.STUDENT.PRACTICE}?mode=spaced`}>Review now</Link>
              </Button>
            </Card>
          )}

          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
              Quick actions
            </p>
            <div className="mt-3 space-y-2">
              <Button asChild variant="secondary" fullWidth>
                <Link to={ROUTES.STUDENT.COURSES}>
                  <BookOpen className="mr-2 h-4 w-4" /> Browse courses
                </Link>
              </Button>
              <Button asChild variant="secondary" fullWidth>
                <Link to={ROUTES.STUDENT.ANALYTICS}>
                  <Target className="mr-2 h-4 w-4" /> View analytics
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
