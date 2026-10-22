import { Link } from 'react-router-dom';
import { ArrowRight, Clock, FileQuestion } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import type { ExamPaper } from '@/types/exam';
import { formatRelative } from '@/lib/date';
import { ROUTES } from '@/router/routes';
import { StatusBadge } from './StatusBadge';

export function PaperCard({ paper }: { paper: ExamPaper }) {
  return (
    <Card className="p-4 transition-colors hover:border-brand-500/40">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <StatusBadge status={paper.status} />
        <Badge tone="default">{paper.difficulty}</Badge>
        {paper.year && <Badge tone="default">{paper.year}</Badge>}
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{paper.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
            <span className="flex items-center gap-1">
              <FileQuestion className="h-3 w-3" /> {paper.totalQuestions} questions
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {paper.durationMinutes} min
            </span>
            <span>·</span>
            <span>updated {formatRelative(paper.updatedAt)}</span>
          </div>
        </div>
        <Button asChild size="sm" variant="secondary" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
          <Link to={ROUTES.TEACHER.PAPER_DETAIL.replace(':paperId', paper.id)}>Open</Link>
        </Button>
      </div>
    </Card>
  );
}
