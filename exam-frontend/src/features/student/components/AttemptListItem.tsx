import { Link } from 'react-router-dom';
import { ArrowRight, FileQuestion } from 'lucide-react';
import { Badge, Card } from '@/components/ui';
import type { Attempt } from '@/types/attempt';
import { formatRelative } from '@/lib/date';
import { ROUTES } from '@/router/routes';

export function AttemptListItem({ attempt }: { attempt: Attempt }) {
  const finished = attempt.status === 'graded';
  return (
    <Link to={ROUTES.STUDENT.RESULT.replace(':attemptId', attempt.id)}>
      <Card className="flex items-center justify-between gap-3 p-4 transition-colors hover:border-brand-500/40">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{attempt.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
            <span className="flex items-center gap-1">
              <FileQuestion className="h-3 w-3" /> {attempt.totalQuestions} questions
            </span>
            <span>·</span>
            <span>{formatRelative(attempt.startedAt)}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {finished ? (
            <Badge tone={attempt.score && attempt.score >= 60 ? 'success' : 'warning'}>
              {attempt.score?.toFixed(0)}%
            </Badge>
          ) : (
            <Badge tone="brand">In progress</Badge>
          )}
          <ArrowRight className="h-4 w-4 text-fg-muted" />
        </div>
      </Card>
    </Link>
  );
}
