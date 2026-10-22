import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Flag,
  LayoutGrid,
  ListChecks,
  Loader2
} from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  Drawer,
  EmptyState,
  IconButton,
  Modal,
  Skeleton
} from '@/components/ui';
import {
  AttemptProgress,
  AttemptTimer,
  OptionCard,
  QuestionPalette
} from '@/features/student/components';
import { useAttemptRunner } from '@/features/student/hooks';
import { useToast } from '@/hooks/useToast';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { ApiError } from '@/lib/api';
import { ROUTES } from '@/router/routes';

export default function AttemptPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { attempt, submit, state } = useAttemptRunner(attemptId);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const data = attempt.data;
  const isActive = data?.status === 'in_progress';
  useBeforeUnload(isActive);

  useEffect(() => {
    if (data && (data.status === 'graded' || data.status === 'submitted')) {
      navigate(ROUTES.STUDENT.RESULT.replace(':attemptId', data.id), { replace: true });
    }
  }, [data, navigate]);

  if (attempt.loading || !data) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-14" />
        <Skeleton className="h-64" />
        <Skeleton className="h-14" />
      </div>
    );
  }

  if (attempt.error || !data.questions || data.questions.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<ListChecks className="h-6 w-6" />}
          title="Attempt unavailable"
          description="We couldn't load this attempt."
          action={
            <Button asChild>
              <a href={ROUTES.STUDENT.PRACTICE}>Back to practice</a>
            </Button>
          }
        />
      </Card>
    );
  }

  const questions = data.questions;
  const current = questions[state.index];
  const answeredCount = Object.keys(state.answers).length;

  const go = (delta: number) => {
    const next = state.index + delta;
    if (next >= 0 && next < questions.length) state.setIndex(next);
  };

  const openSubmit = () => setSubmitOpen(true);

  const doSubmit = async () => {
    setSubmitOpen(false);
    try {
      await submit.mutate();
      toast.success('Attempt submitted');
      navigate(ROUTES.STUDENT.RESULT.replace(':attemptId', data.id), { replace: true });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not submit attempt.';
      toast.error('Submit failed', msg);
    }
  };

  const unanswered = questions.length - answeredCount;

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-4">
      {/* Top bar */}
      <Card className="sticky top-14 z-20 flex items-center gap-2 p-2.5 backdrop-blur-xl sm:p-3">
        <IconButton
          label="Exit attempt"
          onClick={() => {
            if (confirm('Leave without submitting? Your answers are saved.')) {
              navigate(ROUTES.STUDENT.PRACTICE);
            }
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </IconButton>
        <div className="flex-1">
          <AttemptProgress answered={answeredCount} total={questions.length} />
        </div>
        <AttemptTimer
          startedAt={data.startedAt}
          durationMinutes={data.durationMinutes}
          onExpire={openSubmit}
        />
        <IconButton label="Open palette" onClick={() => setPaletteOpen(true)}>
          <LayoutGrid className="h-4 w-4" />
        </IconButton>
      </Card>

      {/* Question */}
      <Card className="p-5 sm:p-6">
        <div className="mb-2 flex items-center justify-between text-xs text-fg-muted">
          <span className="font-medium">
            Question {state.index + 1} of {questions.length}
          </span>
          <button
            type="button"
            onClick={() => state.toggleMarked(current.id)}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs ${
              state.marked[current.id]
                ? 'bg-warning/20 text-amber-200'
                : 'text-fg-muted hover:bg-white/5'
            }`}
          >
            <Flag className="h-3 w-3" /> {state.marked[current.id] ? 'Marked' : 'Mark'}
          </button>
        </div>
        <p className="mb-4 text-base leading-relaxed text-fg sm:text-lg">{current.prompt}</p>
        <div className="space-y-2">
          {current.options.map((opt) => (
            <OptionCard
              key={opt.id}
              label={opt.label}
              text={opt.text}
              selected={state.answers[current.id] === opt.id}
              onClick={() => state.setAnswer(current.id, opt.id)}
            />
          ))}
        </div>
      </Card>

      {/* Bottom bar */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="secondary"
          onClick={() => go(-1)}
          disabled={state.index === 0}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Previous
        </Button>
        {state.index < questions.length - 1 ? (
          <Button
            onClick={() => go(1)}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Next
          </Button>
        ) : (
          <Button onClick={openSubmit}>Submit</Button>
        )}
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" onClick={openSubmit} leftIcon={<ListChecks className="h-4 w-4" />}>
          Finish attempt
        </Button>
      </div>

      {/* Palette drawer */}
      <Drawer open={paletteOpen} onClose={() => setPaletteOpen(false)} title="Questions">
        <QuestionPalette
          questions={questions}
          answers={state.answers}
          marked={state.marked}
          currentIndex={state.index}
          onSelect={(i) => {
            state.setIndex(i);
            setPaletteOpen(false);
          }}
        />
      </Drawer>

      {/* Submit modal */}
      <Modal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        title="Submit attempt?"
        description={
          unanswered > 0
            ? `You still have ${unanswered} unanswered question${unanswered === 1 ? '' : 's'}.`
            : 'All questions answered. Ready to submit?'
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setSubmitOpen(false)}>
              Cancel
            </Button>
            <Button onClick={doSubmit} loading={submit.loading}>
              {submit.loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </>
        }
      >
        {unanswered > 0 ? (
          <Alert tone="warning">Unanswered questions are marked as incorrect.</Alert>
        ) : (
          <Alert tone="success">You'll get instant results and explanations.</Alert>
        )}
      </Modal>
    </div>
  );
}
