import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, FileQuestion, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Button, Card, EmptyState, Skeleton } from '@/components/ui';
import {
  RejectReasonModal,
  ReviewActionBar,
  StatusBadge,
  type WorkflowAction
} from '@/features/teacher/components';
import {
  useDeletePaper,
  usePaperAction,
  useTeacherPaper
} from '@/features/teacher/hooks';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { ROUTES } from '@/router/routes';

export default function PaperDetailPage() {
  const { paperId } = useParams<{ paperId: string }>();
  const paper = useTeacherPaper(paperId);
  const action = usePaperAction();
  const remove = useDeletePaper();
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rejectOpen, setRejectOpen] = useState(false);

  if (paper.loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (paper.error || !paper.data) {
    return (
      <Card>
        <EmptyState
          icon={<FileQuestion className="h-6 w-6" />}
          title="Paper not found"
          description="It may have been removed."
          action={
            <Button asChild>
              <Link to={ROUTES.TEACHER.PAPERS}>Back to papers</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  const p = paper.data;
  const isOwner = p.createdBy === user?.id;
  const canReview = p.status === 'review' && !isOwner;

  const handleAction = async (a: WorkflowAction) => {
    try {
      if (a === 'delete') {
        if (!confirm('Delete this draft paper?')) return;
        await remove.mutate(paperId!);
        toast.success('Paper deleted');
        navigate(ROUTES.TEACHER.PAPERS);
        return;
      }
      if (a === 'reject') {
        setRejectOpen(true);
        return;
      }
      await action.act(paperId!, a);
      toast.success(
        a === 'submit-review'
          ? 'Submitted for review'
          : a === 'approve'
            ? 'Approved and published'
            : a === 'publish'
              ? 'Published'
              : a === 'archive'
                ? 'Archived'
                : 'Done'
      );
      paper.reload();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Action failed';
      toast.error('Action failed', msg);
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await action.act(paperId!, 'reject', reason);
      toast.success('Rejected and returned to draft');
      setRejectOpen(false);
      paper.reload();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Reject failed';
      toast.error('Reject failed', msg);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={ROUTES.TEACHER.PAPERS}
          className="mb-2 inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="h-3 w-3" /> All papers
        </Link>
        <PageHeader
          title={p.title}
          description={`${p.questions.length} questions · ${p.durationMinutes} min`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {p.status === 'draft' && isOwner && (
                <Button asChild variant="secondary" leftIcon={<Pencil className="h-4 w-4" />}>
                  <Link to={ROUTES.TEACHER.PAPER_EDIT.replace(':paperId', p.id)}>Edit</Link>
                </Button>
              )}
              {(p.status === 'draft' ||
                p.status === 'review' ||
                p.status === 'published') && (
                <ReviewActionBar
                  status={p.status}
                  loading={action.loading || remove.loading}
                  onAction={handleAction}
                />
              )}
            </div>
          }
        />
      </div>

      <Card className="p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={p.status} />
          <Badge tone="default">{p.difficulty}</Badge>
          <Badge tone="default">{p.year}</Badge>
          <Badge tone="default">{p.language}</Badge>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-fg-muted">
          <span className="flex items-center gap-1">
            <FileQuestion className="h-3 w-3" /> {p.totalQuestions} questions
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {p.durationMinutes} min
          </span>
        </div>
        {p.status === 'review' && !canReview && (
          <p className="mt-3 rounded-lg border border-warning/20 bg-warning/5 p-2 text-xs text-amber-200">
            A different teacher must approve this paper — you cannot review your own submission.
          </p>
        )}
      </Card>

      <div>
        <h2 className="mb-3 text-base font-semibold">Questions ({p.questions.length})</h2>
        {p.questions.length === 0 ? (
          <Card className="p-6 text-center text-sm text-fg-muted">
            No questions in this paper.
          </Card>
        ) : (
          <div className="space-y-2">
            {p.questions.map((q, i) => (
              <Card key={q.id} className="flex items-start gap-3 p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/5 text-xs font-semibold">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm">{q.prompt}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                    <Badge tone="default">{q.difficulty}</Badge>
                    <span>{q.options.length} options</span>
                  </div>
                </div>
                <Button asChild size="sm" variant="ghost">
                  <Link
                    to={ROUTES.TEACHER.QUESTION_DETAIL.replace(':questionId', q.id)}
                  >
                    View
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <RejectReasonModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
        submitting={action.loading}
      />
    </div>
  );
}
