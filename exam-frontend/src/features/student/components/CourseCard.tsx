import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Lock, Sparkles } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import type { CourseSummary } from '../api';
import { APP } from '@/lib/constants';

export function CourseCard({ course }: { course: CourseSummary }) {
  const isSubscribed = course.subscriptionStatus === 'active';
  const trialActive = course.subscriptionStatus === 'trialing';
  const isFree = isSubscribed || trialActive;

  return (
    <Card className="flex flex-col justify-between p-5">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
            <BookOpen className="h-5 w-5" />
          </span>
          {isSubscribed ? (
            <Badge tone="success" dot>
              Active
            </Badge>
          ) : trialActive ? (
            <Badge tone="brand" dot>
              Trial
            </Badge>
          ) : (
            <Badge tone="warning">Locked</Badge>
          )}
        </div>
        <h3 className="text-base font-semibold">{course.name}</h3>
        <p className="mt-1 text-xs text-fg-muted">
          {course.totalPapers} papers · {course.totalQuestions} questions
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-fg-subtle">
          {isSubscribed ? 'Unlimited access' : `${APP.PRICE_PER_COURSE} ${APP.CURRENCY}`}
        </span>
        {isFree ? (
          <Button asChild size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
            <Link to={`/student/courses/${course.id}`}>Open</Link>
          </Button>
        ) : (
          <Button asChild size="sm" variant="outline" leftIcon={<Lock className="h-3.5 w-3.5" />}>
            <Link to={`/student/courses/${course.id}`}>View</Link>
          </Button>
        )}
      </div>
      {!isFree && !trialActive && (
        <p className="mt-3 flex items-center gap-1 text-[11px] text-fg-subtle">
          <Sparkles className="h-3 w-3" /> Free trial used — subscribe to continue.
        </p>
      )}
    </Card>
  );
}
