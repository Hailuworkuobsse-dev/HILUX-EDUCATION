import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, FileQuestion } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert, Badge, Button, Card, EmptyState, Skeleton } from '@/components/ui';
import { PaperCard } from '@/features/student/components';
import { useCourse } from '@/features/student/hooks';
import { ROUTES } from '@/router/routes';

export default function CourseDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const course = useCourse(subjectId);

  if (course.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (course.error || !course.data) {
    return (
      <Card>
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="Course not found"
          description="The course may have been removed."
          action={
            <Button asChild>
              <Link to={ROUTES.STUDENT.COURSES}>Back to courses</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  const data = course.data;
  const active = data.subscriptionStatus === 'active' || data.subscriptionStatus === 'trialing';

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={ROUTES.STUDENT.COURSES}
          className="mb-2 inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="h-3 w-3" /> All courses
        </Link>
        <PageHeader
          title={data.name}
          description={`${data.totalPapers} papers · ${data.totalQuestions} questions`}
          actions={
            <Button asChild leftIcon={<FileQuestion className="h-4 w-4" />}>
              <Link to={active ? `${ROUTES.STUDENT.PRACTICE}?subjectId=${data.id}` : `${ROUTES.STUDENT.SUBSCRIBE}?subjectId=${data.id}`}>
                {active ? "Build a practice" : "Subscribe to practice"}
              </Link>
            </Button>
          }
        />
      </div>

      {!active && (
        <Alert tone="warning" title="Subscribe to unlock">
          This course is locked. Subscribe for 150 ETB to continue practicing.
          <div className="mt-2">
            <Button asChild size="sm" variant="outline">
              <Link to={`${ROUTES.STUDENT.SUBSCRIBE}?subjectId=${data.id}`}>See plans</Link>
            </Button>
          </div>
        </Alert>
      )}

      <div>
        <h2 className="mb-3 text-base font-semibold">Papers</h2>
        {data.papers.length === 0 ? (
          <Card>
            <EmptyState
              icon={<FileQuestion className="h-6 w-6" />}
              title="No papers published yet"
              description="Teachers are preparing content for this subject."
            />
          </Card>
        ) : (
          <div className="space-y-2">
            {data.papers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} locked={!active} subscribeTo={`${ROUTES.STUDENT.SUBSCRIBE}?subjectId=${data.id}`} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold">Topics</h2>
        <div className="flex flex-wrap gap-2">
          {data.topics.map((t) => (
            <Badge key={t.id} tone="default">
              {t.name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
