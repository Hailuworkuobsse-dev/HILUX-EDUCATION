import { Link } from 'react-router-dom';
import { Eye, Pencil } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import type { Question } from '@/types/question';
import { formatRelative } from '@/lib/date';
import { ROUTES } from '@/router/routes';
import { StatusBadge } from './StatusBadge';

export function QuestionCard({ question }: { question: Question }) {
  return (
    <Card className="p-4 transition-colors hover:border-brand-500/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={question.status} />
            <Badge tone="default">{question.difficulty}</Badge>
            {question.year && <Badge tone="default">{question.year}</Badge>}
            <span className="text-[10px] uppercase tracking-wide text-fg-subtle">
              {question.language}
            </span>
          </div>
          <p className="line-clamp-2 text-sm text-fg">{question.prompt}</p>
          <p className="mt-1 text-xs text-fg-muted">
            {question.options.length} options · updated {formatRelative(question.updatedAt)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          <Button asChild size="sm" variant="ghost" leftIcon={<Eye className="h-3.5 w-3.5" />}>
            <Link to={ROUTES.TEACHER.QUESTION_DETAIL.replace(':questionId', question.id)}>
              View
            </Link>
          </Button>
          {question.status === 'draft' && (
            <Button asChild size="sm" variant="ghost" leftIcon={<Pencil className="h-3.5 w-3.5" />}>
              <Link to={ROUTES.TEACHER.QUESTION_EDIT.replace(':questionId', question.id)}>
                Edit
              </Link>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
