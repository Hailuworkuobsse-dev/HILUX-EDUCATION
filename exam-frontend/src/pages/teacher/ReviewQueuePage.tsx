import { Link } from 'react-router-dom';
import { AlertCircle, FileQuestion } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, EmptyState, Skeleton, Tabs } from '@/components/ui';
import { QuestionCard } from '@/features/teacher/components';
import { PaperCard } from '@/features/teacher/components/PaperCard';
import { useReviewQueue } from '@/features/teacher/hooks';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/router/routes';
import type { Question } from '@/types/question';
import type { ExamPaper } from '@/types/exam';

export default function ReviewQueuePage() {
  const questionsQueue = useReviewQueue('questions');
  const papersQueue = useReviewQueue('papers');
  const { user } = useAuth();

  const questions = (questionsQueue.data ?? []) as Question[];
  const papers = (papersQueue.data ?? []) as ExamPaper[];

  // Filter out own submissions (server also enforces this on action)
  const otherQuestions = questions.filter((q) => q.createdBy !== user?.id);
  const otherPapers = papers.filter((p) => p.createdBy !== user?.id);

  const questionsContent = questionsQueue.loading ? (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  ) : questionsQueue.error ? (
    <Card className="p-5">
      <p className="font-semibold">Question review queue unavailable</p>
      <p className="mt-1 text-sm text-fg-muted">We couldn't retrieve pending question reviews.</p>
      <Button className="mt-3" size="sm" variant="secondary" onClick={questionsQueue.reload}>Retry</Button>
    </Card>
  ) : otherQuestions.length === 0 ? (
    <Card>
      <EmptyState
        icon={<AlertCircle className="h-6 w-6" />}
        title="Nothing to review"
        description="All caught up on questions."
        action={
          <Button asChild variant="secondary">
            <Link to={ROUTES.TEACHER.QUESTIONS}>Browse bank</Link>
          </Button>
        }
      />
    </Card>
  ) : (
    <div className="space-y-2">
      {otherQuestions.map((q) => (
        <QuestionCard key={q.id} question={q} />
      ))}
    </div>
  );

  const papersContent = papersQueue.loading ? (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  ) : papersQueue.error ? (
    <Card className="p-5">
      <p className="font-semibold">Paper review queue unavailable</p>
      <p className="mt-1 text-sm text-fg-muted">We couldn't retrieve pending paper reviews.</p>
      <Button className="mt-3" size="sm" variant="secondary" onClick={papersQueue.reload}>Retry</Button>
    </Card>
  ) : otherPapers.length === 0 ? (
    <Card>
      <EmptyState
        icon={<FileQuestion className="h-6 w-6" />}
        title="Nothing to review"
        description="All caught up on papers."
        action={
          <Button asChild variant="secondary">
            <Link to={ROUTES.TEACHER.PAPERS}>Browse papers</Link>
          </Button>
        }
      />
    </Card>
  ) : (
    <div className="space-y-2">
      {otherPapers.map((p) => (
        <PaperCard key={p.id} paper={p} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review queue"
        description="Submissions waiting for a second teacher's sign-off. You cannot review your own."
      />
      <Tabs
        items={[
          {
            key: 'questions',
            label: `Questions (${otherQuestions.length})`,
            content: questionsContent
          },
          { key: 'papers', label: `Papers (${otherPapers.length})`, content: papersContent }
        ]}
        defaultValue="questions"
      />
    </div>
  );
}
