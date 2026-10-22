import { useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, EmptyState, Input, Skeleton, Tabs } from '@/components/ui';
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
    if (mentees.loading) {
      return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      );
    }
    if (!mentees.data || mentees.data.length === 0) {
      return (
        <Card>
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="No mentees found"
            description={
              search || filter !== 'all'
                ? 'Try adjusting your filters.'
                : 'You have no mentees assigned yet.'
            }
          />
        </Card>
      );
    }
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {mentees.data.map((m) => (
          <MenteeCard key={m.id} mentee={m} />
        ))}
      </div>
    );
  }, [mentees, search, filter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mentees"
        description="Students assigned to you and their progress."
      />

      <Input
        placeholder="Search by name…"
        leftIcon={<Search className="h-4 w-4" />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Tabs
        items={[
          { key: 'all', label: 'All', content: <div>{listContent}</div> },
          {
            key: 'high',
            label: 'At risk',
            content: <div onClick={() => setFilter('high')}>{listContent}</div>
          },
          {
            key: 'medium',
            label: 'Watch',
            content: <div onClick={() => setFilter('medium')}>{listContent}</div>
          },
          {
            key: 'low',
            label: 'On track',
            content: <div onClick={() => setFilter('low')}>{listContent}</div>
          }
        ]}
        defaultValue="all"
      />
    </div>
  );
}
