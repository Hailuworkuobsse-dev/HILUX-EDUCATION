import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Clock, MessageSquare, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Button, Card, EmptyState, Skeleton } from '@/components/ui';
import { StatCard } from '@/features/student/components/StatCard';
import { MenteeCard, ThreadListItem } from '@/features/mentor/components';
import { useMentorOverview } from '@/features/mentor/hooks';
import { ROUTES } from '@/router/routes';

export default function MentorDashboard() {
  const overview = useMentorOverview();
  const data = overview.data;

  return (
    <div className="space-y-6">
      <PageHeader title="Mentor hub" description="Support your mentees and answer their questions." actions={<Button asChild leftIcon={<MessageSquare className="h-4 w-4" />}><Link to={ROUTES.MENTOR.CHAT}>Open chat</Link></Button>} />

      {overview.loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : overview.error ? (
        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div><p className="text-sm font-semibold">Mentor overview could not be loaded</p><p className="text-xs text-fg-muted">{overview.error.message}</p></div>
          <Button variant="secondary" onClick={overview.reload}>Retry</Button>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active mentees" value={data?.activeMentees ?? 0} icon={Users} tone="brand" hint={`+${data?.menteesHelpedThisWeek ?? 0} helped this week`} />
          <StatCard label="Unread threads" value={data?.unreadThreads ?? 0} icon={MessageSquare} tone="accent" hint="Waiting on you" />
          <StatCard label="Open reports" value={data?.openReports ?? 0} icon={AlertCircle} tone="warning" hint="Needs your review" />
          <StatCard label="Response rate" value={`${Math.round(data?.responseRate ?? 0)}%`} icon={Clock} tone="success" hint="Replied within 24h" />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div>
            <div className="mb-3 flex items-center justify-between"><h2 className="text-base font-semibold">Your mentees</h2><Button asChild variant="ghost" size="sm"><Link to={ROUTES.MENTOR.MENTEES}>View all</Link></Button></div>
            {overview.loading ? <div className="grid gap-3 sm:grid-cols-2"><Skeleton className="h-40" /><Skeleton className="h-40" /></div>
              : overview.error ? <Card className="p-4 text-sm text-fg-muted">Mentee preview is unavailable until the overview loads successfully.</Card>
              : data && data.recentMentees.length > 0 ? <div className="grid gap-3 sm:grid-cols-2">{data.recentMentees.slice(0, 4).map((m) => <MenteeCard key={m.id} mentee={m} />)}</div>
              : <Card><EmptyState icon={<Users className="h-6 w-6" />} title="No mentees yet" description="Students will be assigned to you shortly." /></Card>}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">Recent conversations</h3><Badge tone="brand">{data?.unreadThreads ?? 0} unread</Badge></div>
            {overview.loading ? <div className="space-y-2"><Skeleton className="h-14" /><Skeleton className="h-14" /></div>
              : overview.error ? <div className="space-y-2"><p className="text-xs text-fg-muted">Conversation preview is unavailable.</p><Button variant="secondary" size="sm" onClick={overview.reload}>Retry</Button></div>
              : data && data.recentThreads.length > 0 ? <div className="space-y-1">{data.recentThreads.slice(0, 4).map((t) => <Link key={t.id} to={ROUTES.MENTOR.CHAT_THREAD.replace(':threadId', t.id)} className="block"><ThreadListItem thread={t} active={false} onClick={() => undefined} /></Link>)}<Button asChild variant="ghost" size="sm" fullWidth className="mt-2"><Link to={ROUTES.MENTOR.CHAT}>All conversations <ArrowRight className="ml-1 h-3 w-3" /></Link></Button></div>
              : <p className="py-4 text-center text-xs text-fg-muted">No conversations yet.</p>}
          </Card>

          {!overview.error && (data?.openReports ?? 0) > 0 && <Card className="border-warning/30 bg-warning/5 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-amber-300">Attention needed</p><p className="mt-1 text-2xl font-bold">{data?.openReports}</p><p className="text-xs text-fg-muted">Open reports from students awaiting review.</p><Button asChild size="sm" fullWidth className="mt-3" variant="outline"><Link to={ROUTES.MENTOR.REPORTS}>View reports</Link></Button></Card>}
        </div>
      </div>
    </div>
  );
}
