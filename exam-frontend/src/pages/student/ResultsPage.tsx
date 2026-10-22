import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, EmptyState, Skeleton } from '@/components/ui';
import { AttemptListItem } from '@/features/student/components';
import { useAttempts } from '@/features/student/hooks';
import { ROUTES } from '@/router/routes';

export default function ResultsPage() {
  const attempts = useAttempts({ limit: 50 });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your results"
        description="Review past attempts and learn from every mistake."
      />
      {attempts.loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : attempts.data && attempts.data.length > 0 ? (
        <div className="space-y-2">
          {attempts.data.map((a) => (
            <AttemptListItem key={a.id} attempt={a} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<Trophy className="h-6 w-6" />}
            title="No results yet"
            description="Complete your first practice attempt to see results here."
            action={
              <Button asChild>
                <Link to={ROUTES.STUDENT.PRACTICE}>Start practicing</Link>
              </Button>
            }
          />
        </Card>
      )}
    </div>
  );
}
