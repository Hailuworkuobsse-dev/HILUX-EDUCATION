import { AlertTriangle, Check, EyeOff, Trash2 } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import type { ContentFlag, ContentFlagResolution } from '@/types/admin';
import { formatRelative } from '@/lib/date';

export interface ContentFlagCardProps {
  flag: ContentFlag;
  onResolve: (resolution: ContentFlagResolution, reason: string) => Promise<void>;
  resolving: boolean;
}

export function ContentFlagCard({ flag, onResolve, resolving }: ContentFlagCardProps) {
  const handle = (resolution: ContentFlagResolution) => {
    const reason = window.prompt(
      resolution === 'keep'
        ? 'Why is this content acceptable?'
        : `Reason for ${resolution}:`,
      ''
    );
    if (reason && reason.trim().length >= 10) {
      void onResolve(resolution, reason.trim());
    }
  };

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <Badge tone="warning">{flag.reason}</Badge>
          <Badge tone="default">{flag.subjectName}</Badge>
        </div>
        <span className="text-xs text-fg-muted">{formatRelative(flag.createdAt)}</span>
      </div>
      <p className="line-clamp-2 rounded-lg border border-border bg-bg-elevated/40 p-2 text-sm">
        {flag.questionPrompt}
      </p>
      <p className="mt-2 text-sm text-fg">{flag.description}</p>
      <p className="mt-1 text-xs text-fg-muted">Flagged by {flag.flaggedByName}</p>

      {flag.status === 'open' && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<EyeOff className="h-3.5 w-3.5" />}
            onClick={() => handle('unpublish')}
            disabled={resolving}
          >
            Unpublish
          </Button>
          <Button
            size="sm"
            variant="danger"
            leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            onClick={() => handle('delete')}
            disabled={resolving}
          >
            Delete
          </Button>
          <Button
            size="sm"
            variant="success"
            leftIcon={<Check className="h-3.5 w-3.5" />}
            onClick={() => handle('keep')}
            disabled={resolving}
          >
            Keep
          </Button>
        </div>
      )}

      {flag.status !== 'open' && (
        <p className="mt-2 text-xs text-fg-muted">
          Resolved as <span className="text-fg">{flag.resolution}</span>
          {flag.resolvedAt && ` · ${formatRelative(flag.resolvedAt)}`}
        </p>
      )}
    </Card>
  );
}
