import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, EmptyState, Input, Select, Skeleton } from '@/components/ui';
import { PaperCard } from '@/features/teacher/components';
import { useTeacherPapers, useSubjects } from '@/features/teacher/hooks';
import { useDebounce } from '@/hooks/useDebounce';

const STATUSES = ['draft', 'review', 'published', 'archived'] as const;

export default function PapersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [subjectId, setSubjectId] = useState<string>('');
  const debounced = useDebounce(search, 300);
  const papers = useTeacherPapers({
    search: debounced || undefined,
    status: (status || undefined) as never,
    subjectId: subjectId || undefined
  });
  const subjects = useSubjects();

  const subjectOptions = useMemo(
    () => subjects.data?.map((s) => ({ value: s.id, label: s.name })) ?? [],
    [subjects.data]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam papers"
        description="Build and publish MCQ papers."
        actions={
          <Button asChild leftIcon={<Plus className="h-4 w-4" />}>
            <Link to="/teacher/papers/new">New paper</Link>
          </Button>
        }
      />

      <Card className="grid gap-3 p-3 sm:grid-cols-3">
        <Input
          placeholder="Search papers…"
          leftIcon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          options={[
            { value: '', label: 'All statuses' },
            ...STATUSES.map((s) => ({ value: s, label: s }))
          ]}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
        <Select
          options={[{ value: '', label: 'All subjects' }, ...subjectOptions]}
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
        />
      </Card>

      {papers.loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : papers.error ? (
        <Card className="p-5">
          <p className="font-semibold">Exam papers unavailable</p>
          <p className="mt-1 text-sm text-fg-muted">The paper list could not be retrieved. Try again before changing your filters.</p>
          <Button className="mt-3" variant="secondary" onClick={papers.reload}>Retry</Button>
        </Card>
      ) : papers.data && papers.data.length > 0 ? (
        <div className="space-y-2">
          {papers.data.map((p) => (
            <PaperCard key={p.id} paper={p} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<FileQuestion className="h-6 w-6" />}
            title="No papers found"
            description={
              debounced || status || subjectId
                ? 'Try adjusting your filters.'
                : 'Create your first exam paper.'
            }
            action={
              <Button asChild>
                <Link to="/teacher/papers/new">Create paper</Link>
              </Button>
            }
          />
        </Card>
      )}
    </div>
  );
}
