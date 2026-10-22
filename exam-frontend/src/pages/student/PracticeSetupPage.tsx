import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileQuestion, Lightbulb, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert, Button, Card, Checkbox, Input, Select, Skeleton, Tabs } from '@/components/ui';
import { PaperCard, PracticeModeCard } from '@/features/student/components';
import {
  useCourse,
  useCourses,
  useDueReviews,
  usePapers,
  useStartAttempt
} from '@/features/student/hooks';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/lib/api';
import { ROUTES } from '@/router/routes';

type Mode = 'custom' | 'spaced';

export default function PracticeSetupPage() {
  const [params] = useSearchParams();
  const initialPaperId = params.get('paperId');
  const initialSubjectId = params.get('subjectId');
  const initialMode: Mode = params.get('mode') === 'spaced' ? 'spaced' : 'custom';
  const navigate = useNavigate();
  const toast = useToast();
  const start = useStartAttempt();
  const paperStartRequest = useRef<{ id: string; promise: ReturnType<typeof start.mutate> } | null>(null);

  const courses = useCourses();
  const [subjectId, setSubjectId] = useState<string>(initialSubjectId ?? '');
  const [mode, setMode] = useState<Mode>(initialMode);
  const [topicIds, setTopicIds] = useState<string[]>([]);
  const [count, setCount] = useState<number>(15);

  const detail = useCourse(subjectId || undefined);
  const due = useDueReviews();

  useEffect(() => {
    if (!subjectId && courses.data && courses.data.length > 0) {
      setSubjectId(courses.data[0].id);
    }
  }, [courses.data, subjectId]);

  // If a paperId was passed, start the attempt immediately.
  useEffect(() => {
    if (!initialPaperId) return;
    let cancelled = false;
    let request = paperStartRequest.current;
    if (!request || request.id !== initialPaperId) {
      request = {
        id: initialPaperId,
        promise: start.mutate({ paperId: initialPaperId })
      };
      paperStartRequest.current = request;
    }
    request.promise
      .then((attempt) => {
        if (cancelled) return;
        navigate(ROUTES.STUDENT.ATTEMPT.replace(':attemptId', attempt.id), {
          replace: true
        });
      })
      .catch((e) => {
        if (cancelled) return;
        if (paperStartRequest.current?.id === initialPaperId) {
          paperStartRequest.current = null;
        }
        const msg = e instanceof ApiError ? e.message : 'Could not start paper.';
        toast.error('Could not start paper', msg);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPaperId]);

  const subjectOptions = useMemo(
    () => (courses.data ?? []).map((c) => ({ value: c.id, label: c.name })),
    [courses.data]
  );

  const startCustom = async () => {
    if (!subjectId) return;
    if (mode === 'custom' && topicIds.length === 0) {
      toast.error('Pick at least one topic');
      return;
    }
    try {
      const attempt = await start.mutate({
        practice: { subjectId, topicIds, questionCount: count, mode }
      });
      navigate(ROUTES.STUDENT.ATTEMPT.replace(':attemptId', attempt.id));
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not start practice.';
      toast.error('Could not start practice', msg);
    }
  };

  const paperListTab = (
    <div className="space-y-2">
      <PapersList subjectId={subjectId} />
    </div>
  );

  const builderTab = (
    <Card className="p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <PracticeModeCard
          icon={Lightbulb}
          title="Custom practice"
          description="Pick topics and question count."
          active={mode === 'custom'}
          onClick={() => setMode('custom')}
        />
        <PracticeModeCard
          icon={Sparkles}
          title="Spaced review"
          description={`${due.data?.length ?? 0} questions due`}
          active={mode === 'spaced'}
          onClick={() => setMode('spaced')}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Select
          label="Subject"
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            setTopicIds([]);
          }}
          options={subjectOptions}
          placeholder="Choose subject"
        />
        <Input
          label="Questions"
          type="number"
          min={5}
          max={100}
          value={count}
          step={1}
          onChange={(e) => setCount(Math.min(100, Math.max(5, Number(e.target.value) || 5)))}
        />
      </div>

      {mode === 'custom' && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium">Topics</p>
          {detail.loading ? (
            <Skeleton className="h-24" />
          ) : detail.error ? (
            <Alert tone="warning" title="Topics could not be loaded">
              <div className="flex flex-wrap items-center gap-2">
                <span>Retry loading the selected subject's topics.</span>
                <Button size="sm" variant="secondary" onClick={detail.reload}>Retry</Button>
              </div>
            </Alert>
          ) : detail.data && detail.data.topics.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {detail.data.topics.map((t) => (
                <Checkbox
                  key={t.id}
                  label={t.name}
                  checked={topicIds.includes(t.id)}
                  onChange={(e) =>
                    setTopicIds((prev) =>
                      e.target.checked ? [...prev, t.id] : prev.filter((id) => id !== t.id)
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-fg-muted">No topics available.</p>
          )}
        </div>
      )}

      {mode === 'spaced' && due.error && (
        <Alert tone="warning" title="Review queue unavailable">
          Could not load questions due for review. Retry before starting a spaced-review session.
          <Button className="mt-2" size="sm" variant="secondary" onClick={due.reload}>Retry</Button>
        </Alert>
      )}

      {mode === 'spaced' && (
        <div className="mt-4">
          <Alert tone="info">
            {due.data && due.data.length > 0
              ? `${due.data.length} questions are ready for spaced review.`
              : 'Nothing due right now. Practice more to build up your review queue.'}
          </Alert>
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <Button
          size="lg"
          loading={start.loading}
          disabled={mode === 'spaced' && !(due.data && due.data.length > 0)}
          onClick={startCustom}
        >
          Start practice
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Practice"
        description="Start a paper or build a custom session."
      />
      <Tabs
        items={[
          { key: 'papers', label: 'From paper', content: paperListTab },
          { key: 'builder', label: 'Build practice', content: builderTab }
        ]}
        defaultValue="papers"
      />
    </div>
  );
}

function PapersList({ subjectId }: { subjectId: string }) {
  const papers = usePapers(subjectId || undefined);
  if (papers.loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  }
  if (papers.error) {
    return (
      <Card className="p-6 text-center text-sm text-fg-muted">
        <FileQuestion className="mx-auto mb-2 h-6 w-6 text-fg-subtle" />
        Papers could not be loaded. Check your connection and try again.
        <div className="mt-3">
          <Button size="sm" variant="secondary" onClick={papers.reload}>Retry</Button>
        </div>
      </Card>
    );
  }
  if (!papers.data || papers.data.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-fg-muted">
        <FileQuestion className="mx-auto mb-2 h-6 w-6 text-fg-subtle" />
        No papers available. Try a custom practice instead.
      </Card>
    );
  }
  return (
    <div className="space-y-2">
      {papers.data.map((p) => (
        <PaperCard key={p.id} paper={p} />
      ))}
    </div>
  );
}
