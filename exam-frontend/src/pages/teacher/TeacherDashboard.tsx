import { Link } from 'react-router-dom';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  FileEdit,
  FileQuestion,
  Plus,
  Upload
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, Skeleton } from '@/components/ui';
import { StatCard } from '@/features/student/components/StatCard';
import { useTeacherOverview, useTeacherPapers } from '@/features/teacher/hooks';
import { PaperCard } from '@/features/teacher/components';
import { ROUTES } from '@/router/routes';

export default function TeacherDashboard() {
  const overview = useTeacherOverview();
  const recentPapers = useTeacherPapers({ status: 'draft' });
  const data = overview.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher hub"
        description="Author quality exam content and keep the bank healthy."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="secondary" leftIcon={<Upload className="h-4 w-4" />}>
              <Link to={ROUTES.TEACHER.BULK_IMPORT}>Bulk import</Link>
            </Button>
            <Button asChild leftIcon={<Plus className="h-4 w-4" />}>
              <Link to={ROUTES.TEACHER.PAPER_NEW}>New paper</Link>
            </Button>
          </div>
        }
      />

      {overview.loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : overview.error ? (
        <Card className="p-5">
          <p className="font-semibold">Teacher overview unavailable</p>
          <p className="mt-1 text-sm text-fg-muted">Your content totals could not be loaded. These are not zero counts.</p>
          <Button className="mt-3" variant="secondary" onClick={overview.reload}>Retry</Button>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Draft questions"
            value={data?.draftQuestions ?? 0}
            icon={FileEdit}
            tone="brand"
            hint="Unpublished"
          />
          <StatCard
            label="In review"
            value={data?.reviewQuestions ?? 0}
            icon={AlertCircle}
            tone="warning"
            hint="Awaiting sign-off"
          />
          <StatCard
            label="Published questions"
            value={data?.publishedQuestions ?? 0}
            icon={CheckCircle2}
            tone="success"
            hint="Live in bank"
          />
          <StatCard
            label="Pending reviews"
            value={data?.pendingReviews ?? 0}
            icon={BookOpen}
            tone="accent"
            hint="Your turn to review"
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Draft papers</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.TEACHER.PAPERS}>All papers</Link>
            </Button>
          </div>
          {recentPapers.loading ? (
            <div className="space-y-2">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ) : recentPapers.error ? (
            <Card className="p-5">
              <p className="text-sm text-fg-muted">Draft papers could not be loaded.</p>
              <Button className="mt-3" size="sm" variant="secondary" onClick={recentPapers.reload}>Retry</Button>
            </Card>
          ) : recentPapers.data && recentPapers.data.length > 0 ? (
            <div className="space-y-2">
              {recentPapers.data.slice(0, 5).map((p) => (
                <PaperCard key={p.id} paper={p} />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <FileQuestion className="mx-auto mb-2 h-6 w-6 text-fg-subtle" />
              <p className="text-sm text-fg-muted">No draft papers. Create your first one.</p>
              <Button asChild size="sm" className="mt-3">
                <Link to={ROUTES.TEACHER.PAPER_NEW}>Create paper</Link>
              </Button>
            </Card>
          )}
        </div>

        <div className="space-y-3">
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
              Quick actions
            </p>
            <div className="mt-3 space-y-2">
              <Button asChild variant="secondary" fullWidth>
                <Link to={ROUTES.TEACHER.QUESTION_NEW}>
                  <Plus className="mr-2 h-4 w-4" /> New question
                </Link>
              </Button>
              <Button asChild variant="secondary" fullWidth>
                <Link to={ROUTES.TEACHER.QUESTIONS}>
                  <BookOpen className="mr-2 h-4 w-4" /> Question bank
                </Link>
              </Button>
              <Button asChild variant="secondary" fullWidth>
                <Link to={ROUTES.TEACHER.REVIEW}>
                  <AlertCircle className="mr-2 h-4 w-4" /> Review queue
                </Link>
              </Button>
            </div>
          </Card>
          {(data?.pendingReviews ?? 0) > 0 && (
            <Card className="border-warning/30 bg-warning/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
                Pending reviews
              </p>
              <p className="mt-1 text-2xl font-bold">{data?.pendingReviews}</p>
              <p className="text-xs text-fg-muted">Waiting for a second teacher to sign off.</p>
              <Button asChild size="sm" variant="outline" fullWidth className="mt-3">
                <Link to={ROUTES.TEACHER.REVIEW}>Review now</Link>
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
