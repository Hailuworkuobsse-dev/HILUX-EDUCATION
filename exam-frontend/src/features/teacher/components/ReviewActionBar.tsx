import { Archive, CheckCircle2, Send, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui';
import type { QuestionStatus } from '@/lib/constants';

export type WorkflowAction = 'submit-review' | 'approve' | 'reject' | 'publish' | 'archive' | 'delete';

export interface ReviewActionBarProps {
  status: QuestionStatus;
  loading?: boolean;
  onAction: (action: WorkflowAction) => void;
  extra?: React.ReactNode;
}

export function ReviewActionBar({ status, loading, onAction, extra }: ReviewActionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {extra}
      {status === 'draft' && (
        <>
          <Button
            variant="primary"
            leftIcon={<Send className="h-4 w-4" />}
            onClick={() => onAction('submit-review')}
            disabled={loading}
          >
            Submit for review
          </Button>
          <Button
            variant="danger"
            leftIcon={<Trash2 className="h-4 w-4" />}
            onClick={() => onAction('delete')}
            disabled={loading}
          >
            Delete
          </Button>
        </>
      )}
      {status === 'review' && (
        <>
          <Button
            variant="success"
            leftIcon={<CheckCircle2 className="h-4 w-4" />}
            onClick={() => onAction('approve')}
            disabled={loading}
          >
            Approve &amp; publish
          </Button>
          <Button
            variant="danger"
            leftIcon={<X className="h-4 w-4" />}
            onClick={() => onAction('reject')}
            disabled={loading}
          >
            Reject
          </Button>
        </>
      )}
      {status === 'published' && (
        <Button
          variant="secondary"
          leftIcon={<Archive className="h-4 w-4" />}
          onClick={() => onAction('archive')}
          disabled={loading}
        >
          Archive
        </Button>
      )}
    </div>
  );
}
