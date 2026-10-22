import { Flame, Target, TrendingUp, Trophy } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, Skeleton } from '@/components/ui';
import {
  ScoreTrendChart,
  StatCard,
  TopicAccuracyChart
} from '@/features/student/components';
import {
  useProgress,
  useStudentOverview,
  useTopicAccuracy
} from '@/features/student/hooks';

export default function AnalyticsPage() {
  const overview = useStudentOverview();
  const topicAccuracy = useTopicAccuracy();
  const progress = useProgress();
  const stats = overview.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="See where you're strong and where to focus next."
      />

      {overview.loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : overview.error ? (
        <Card className="p-5">
          <p className="font-semibold">Analytics summary unavailable</p>
          <p className="mt-1 text-sm text-fg-muted">We could not retrieve your performance metrics. Please retry before interpreting these results.</p>
          <Button className="mt-3" variant="secondary" onClick={overview.reload}>Retry</Button>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Accuracy"
            value={`${stats?.overallAccuracy.toFixed(0) ?? 0}%`}
            icon={Target}
            tone="brand"
            hint={`${stats?.totalQuestionsAnswered ?? 0} answered`}
          />
          <StatCard
            label="Average score"
            value={`${stats?.averageScore.toFixed(0) ?? 0}%`}
            icon={TrendingUp}
            tone="accent"
            hint={`${stats?.totalAttempts ?? 0} attempts`}
          />
          <StatCard
            label="Mastered"
            value={stats?.questionsMastered ?? 0}
            icon={Trophy}
            tone="success"
            hint="Questions answered correctly 3+ times"
          />
          <StatCard
            label="Streak"
            value={`${stats?.streakDays ?? 0} days`}
            icon={Flame}
            tone="warning"
            hint="Consecutive practice days"
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-fg-muted">
            Score trend
          </h2>
          {progress.loading ? (
            <Skeleton className="h-56" />
          ) : progress.error ? (
            <div className="py-8 text-center">
              <p className="text-sm text-fg-muted">Score trend could not be loaded.</p>
              <Button className="mt-2" size="sm" variant="secondary" onClick={progress.reload}>Retry</Button>
            </div>
          ) : (
            <ScoreTrendChart data={progress.data ?? []} />
          )}
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-fg-muted">
            Weakest topics
          </h2>
          {topicAccuracy.loading ? (
            <Skeleton className="h-56" />
          ) : topicAccuracy.error ? (
            <div className="py-8 text-center">
              <p className="text-sm text-fg-muted">Topic insights could not be loaded.</p>
              <Button className="mt-2" size="sm" variant="secondary" onClick={topicAccuracy.reload}>Retry</Button>
            </div>
          ) : (
            <TopicAccuracyChart data={topicAccuracy.data ?? []} />
          )}
        </Card>
      </div>
    </div>
  );
}
