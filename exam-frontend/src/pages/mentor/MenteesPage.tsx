import { useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, EmptyState, Input, Skeleton, Tabs } from '@/components/ui';
import { MenteeCard } from '@/features/mentor/components';
import { useMentees } from '@/features/mentor/hooks';
import { useDebounce } from '@/hooks/useDebounce';
import type { MenteeRiskLevel } from '@/types/mentor';

type Filter = 'all' | MenteeRiskLevel;

export default function MenteesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const debouncedSearch = useDebounce(search, 300);
  const mentees = useMentees({ search: debouncedSearch || undefined, risk: filter });

  const listContent = useMemo(() => {
    if (mentees.loading) return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-40" />)}</div>;
    if (mentees.error) return <Card className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="text-sm font-semibold">Mentees could not be loaded</p><p className="text-xs text-fg-muted">{mentees.error.message}</p></div><Button variant="secondary" onClick={mentees.reload}>Retry</Button></Card>;
    if (!mentees.data || mentees.data.length === 0) return <Card><EmptyState icon={<Users className="h-6 w-6" />} title="No mentees found" description={search || filter !== 'all' ? 'Try adjusting your filters.' : 'You have no mentees assigned yet.'} /></Card>;
    return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{mentees.data.map((m) => <MenteeCard key={m.id} mentee={m} />)}</div>;
  }, [mentees.loading, mentees.error, mentees.data, mentees.reload, search, filter]);

  return <div className="space-y-6">
    <PageHeader title="Mentees" description="Students assigned to you and their progress." />
    <Input placeholder="Search by name…" leftIcon={<Search className="h-4 w-4" />} value={search} onChange={(e) => setSearch(e.target.value)} />
    <Tabs items={[{ key: 'all', label: 'All', content: listContent }, { key: 'high', label: 'At risk', content: listContent }, { key: 'medium', label: 'Watch', content: listContent }, { key: 'low', label: 'On track', content: listContent }]} value={filter} onChange={(key) => setFilter(key as Filter)} />
  </div>;
}
