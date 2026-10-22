import { Link } from 'react-router-dom';
import { Clock, FileQuestion, Play } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import type { ExamPaper } from '@/types/exam';

export function PaperCard({ paper }: { paper: ExamPaper }) {
  return (
    <Card className="flex items-center justify-between gap-4 p-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{paper.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
          <span className="flex items-center gap-1">
            <FileQuestion className="h-3 w-3" /> {paper.totalQuestions} questions
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {paper.durationMinutes} min
          </span>
          <Badge tone="default">{paper.difficulty}</Badge>
          {paper.year && <span>{paper.year}</span>}
        </div>
      </div>
      <Button asChild size="sm" leftIcon={<Play className="h-3.5 w-3.5" />}>
        <Link to={`/student/practice?paperId=${paper.id}`}>Start</Link>
      </Button>
    </Card>
  );
}
