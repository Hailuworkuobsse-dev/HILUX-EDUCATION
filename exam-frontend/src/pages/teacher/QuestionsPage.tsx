import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, EmptyState, Input, Select, Skeleton } from '@/components/ui';
import { QuestionCard } from '@/features/teacher/components';
import { useSubjects, useTeacherQuestions } from '@/features/teacher/hooks';
import { useDebounce } from '@/hooks/useDebounce';
import { DIFFICULTIES } from '@/lib/constants';
import { ROUTES } from '@/router/routes';

const STATUSES = ['draft', 'review', 'published', 'archived'] as const;

export default function QuestionsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search, 300);

  const subjects = useSubjects();
  const questions = useTeacherQuestions({
    search: debounced || undefined,
    status: (status || undefined) as never,
    subjectId: subjectId || undefined,
    difficulty: (difficulty || undefined) as never,
    page,
    pageSize: 20
  });

  const subjectOptions = useMemo(
    () => subjects.data?.map((s) => ({ value: s.id, label: s.name })) ?? [],
    [subjects.data]
  );

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setSubjectId('');
    setDifficulty('');
    setPage(1);
  };

  const totalPages = questions.data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Question bank"
        description="Search, filter, and manage every question."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="secondary" leftIcon={<BookOpen className="h-4 w-4" />}>
              <Link to={ROUTES.TEACHER.REVIEW}>Review queue</Link>
            </Button>
            <Button asChild leftIcon={<Plus className="h-4 w-4" />}>
              <Link to={ROUTES.TEACHER.QUESTION_NEW}>New question</Link>
            </Button>
          </div>
        }
      />

      <Card className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder="Search prompts…"
          leftIcon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Select
          options={[{ value: '', label: 'All statuses' }, ...STATUSES.map((s) => ({ value: s, label: s }))]}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        />
        <Select
          options={[{ value: '', label: 'All subjects' }, ...subjectOptions]}
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            setPage(1);
          }}
        />
        <Select
          options={[
            { value: '', label: 'Any difficulty' },
            ...DIFFICULTIES.map((d) => ({ value: d, label: d }))
          ]}
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value);
            setPage(1);
          }}
        />
      </Card>

      {questions.loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : questions.error ? (
        <Card className="p-5">
          <p className="font-semibold">Question bank unavailable</p>
          <p className="mt-1 text-sm text-fg-muted">Questions could not be retrieved. Your saved questions have not been removed.</p>
          <Button className="mt-3" variant="secondary" onClick={questions.reload}>Retry</Button>
        </Card>
      ) : questions.data && questions.data.items.length > 0 ? (
        <>
          <div className="space-y-2">
            {questions.data.items.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-fg-muted">
            <span>
              Page {questions.data.page} of {totalPages} · {questions.data.total} total
            </span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <Card>
          <EmptyState
            icon={<BookOpen className="h-6 w-6" />}
            title="No questions"
            description="Try adjusting filters or create a new question."
            action={
              <div className="flex gap-2">
                <Button variant="secondary" onClick={resetFilters}>
                  Clear filters
                </Button>
                <Button asChild>
                  <Link to={ROUTES.TEACHER.QUESTION_NEW}>New question</Link>
                </Button>
              </div>
            }
          />
        </Card>
      )}
    </div>
  );
}
