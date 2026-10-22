import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Avatar, Badge, Button, Card, Progress } from '@/components/ui';
import type { Mentee } from '@/types/mentor';
import { formatRelative } from '@/lib/date';
import { ROUTES } from '@/router/routes';
import { RiskBadge } from './RiskBadge';

export function MenteeCard({ mentee }: { mentee: Mentee }) {
  return (
    <Card className="flex flex-col gap-3 p-4 transition-colors hover:border-brand-500/40">
      <div className="flex items-start gap-3">
        <Avatar src={mentee.avatarUrl} name={mentee.studentName} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold">{mentee.studentName}</p>
            <RiskBadge level={mentee.riskLevel} />
          </div>
          <p className="mt-0.5 text-xs text-fg-muted">
            {mentee.grade ? `Grade ${mentee.grade} · ` : ''}
            Active {formatRelative(mentee.lastActiveAt)}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {mentee.subjects.slice(0, 3).map((s) => (
              <Badge key={s} tone="default" className="text-[10px]">
                {s}
              </Badge>
            ))}
            {mentee.subjects.length > 3 && (
              <Badge tone="default" className="text-[10px]">
                +{mentee.subjects.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-fg-muted">
          <span>Accuracy</span>
          <span className="font-semibold text-fg">{mentee.accuracy.toFixed(0)}%</span>
        </div>
        <Progress
          value={mentee.accuracy}
          tone={mentee.accuracy >= 75 ? 'success' : mentee.accuracy >= 50 ? 'warning' : 'danger'}
          size="sm"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-fg-subtle">{mentee.attemptsCount} attempts</span>
        <Button asChild size="sm" variant="secondary" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
          <Link to={ROUTES.MENTOR.MENTEE_DETAIL.replace(':menteeId', mentee.id)}>
            View
          </Link>
        </Button>
      </div>
    </Card>
  );
}
