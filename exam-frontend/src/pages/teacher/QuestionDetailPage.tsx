import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Button, Card, EmptyState, Skeleton } from '@/components/ui';
import {
  QuestionPreview,
  RejectReasonModal,
  ReviewActionBar,
  StatusBadge,
  type WorkflowAction
} from '@/features/teacher/components';
import {
  useDeleteQuestion,
  useQuestionAction,
  useTeacherQuestion
} from '@/features/teacher/hooks';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { ROUTES } from '@/router/routes';

export default function QuestionDetailPage() {
  const { questionId } = useParams<{ questionId: string }>();
  const question = useTeacherQuestion(questionId);
  const action = useQuestionAction();
  const remove = useDeleteQuestion();
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rejectOpen, setRejectOpen] = useState(false);

  if (question.loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (question.error || !question.data) {
    return (
      <Card>
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="Question not found"
          description="It may have been removed."
          action={
            <Button asChild>
              <Link to={ROUTES.TEACHER.QUESTIONS}>Back to bank</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  const q = question.data;
  const isOwner = q.createdBy === user?.id;
  const canReview = q.status === 'review' && !isOwner;

  const handleAction = async (a: WorkflowAction) => {
    try {
      if (a === 'delete') {
        if (!confirm('Delete this draft question?')) return;
        await remove.mutate(questionId!);
        toast.success('Question deleted');
        navigate(ROUTES.TEACHER.QUESTIONS);
        return;
      }
      if (a === 'reject') {
        setRejectOpen(true);
        return;
      }
      await action.act(questionId!, a);
      toast.success(
        a === 'submit-review'
          ? 'Submitted for review'
          : a === 'approve'
            ? 'Approved'
            : a === 'publish'
              ? 'Published'
              : a === 'archive'
                ? 'Archived'
                : 'Done'
      );
      question.reload();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Action failed';
      toast.error('Action failed', msg);
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await action.act(questionId!, 'reject', reason);
      toast.success('Returned to draft');
      setRejectOpen(false);
      question.reload();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Reject failed';
      toast.error('Reject failed', msg);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={ROUTES.TEACHER.QUESTIONS}
          className="mb-2 inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="h-3 w-3" /> Question bank
        </Link>
        <PageHeader
          title="Question"
          description={`Version ${q.version} · created ${new Date(q.createdAt).toLocaleDateString()}`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {q.status === 'draft' && isOwner && (
                <Button asChild variant="secondary" leftIcon={<Pencil className="h-4 w-4" />}>
                  <Link to={ROUTES.TEACHER.QUESTION_EDIT.replace(':questionId', q.id)}>
                    Edit
                  </Link>
                </Button>
              )}
              <ReviewActionBar
                status={q.status}
                loading={action.loading || remove.loading}
                onAction={handleAction}
              />
            </div>
          }
        />
      </div>

      <Card className="flex flex-wrap items-center gap-2 p-3">
        <StatusBadge status={q.status} />
        <Badge tone="default">{q.difficulty}</Badge>
        {q.year && <Badge tone="default">{q.year}</Badge>}
        <Badge tone="default">{q.language}</Badge>
      </Card>

      <QuestionPreview
        prompt={q.prompt}
        options={q.options.map((o) => ({ id: o.id, label: o.label, text: o.text }))}
        correctOptionId={q.correctOptionId}
        explanation={q.explanation ?? undefined}
      />

      {q.status === 'review' && !canReview && (
        <p className="rounded-lg border border-warning/20 bg-warning/5 p-3 text-xs text-amber-200">
          A different teacher must approve this question — you cannot review your own submission.
        </p>
      )}

      <RejectReasonModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
        submitting={action.loading}
      />
    </div>
  );
}
