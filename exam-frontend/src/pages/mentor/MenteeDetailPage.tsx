import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, MessageSquare, Target, Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar, Badge, Button, Card, EmptyState, Progress, Skeleton } from '@/components/ui';
import { RiskBadge, ThreadListItem } from '@/features/mentor/components';
import { useMentee } from '@/features/mentor/hooks';
import { formatRelative } from '@/lib/date';
import { ROUTES } from '@/router/routes';

export default function MenteeDetailPage() {
  const { menteeId } = useParams<{ menteeId: string }>();
  const mentee = useMentee(menteeId);

  if (mentee.loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32" /><Skeleton className="h-48" /></div>;

  if (mentee.error || !mentee.data) return <Card className="p-4"><EmptyState icon={<Users className="h-6 w-6" />} title={mentee.error ? 'Unable to load mentee' : 'Mentee not found'} description={mentee.error ? mentee.error.message : 'This mentee may no longer be assigned to you.'} action={mentee.error ? <Button variant="secondary" onClick={mentee.reload}>Retry</Button> : <Button asChild><Link to={ROUTES.MENTOR.MENTEES}>Back to mentees</Link></Button>} />{mentee.error && <div className="mt-2 text-center"><Button asChild variant="ghost"><Link to={ROUTES.MENTOR.MENTEES}>Back to mentees</Link></Button></div>}</Card>;

  const m = mentee.data;
  const threads = m.threads ?? [];

  return <div className="space-y-6">
    <div><Link to={ROUTES.MENTOR.MENTEES} className="mb-2 inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg"><ArrowLeft className="h-3 w-3" /> All mentees</Link>
      <PageHeader title={m.studentName} description={`${m.grade ? `Grade ${m.grade} · ` : ''}Active ${formatRelative(m.lastActiveAt)}`} actions={threads[0] && <Button asChild leftIcon={<MessageSquare className="h-4 w-4" />}><Link to={ROUTES.MENTOR.CHAT_THREAD.replace(':threadId', threads[0].id)}>Message</Link></Button>} />
    </div>
    <Card className="p-5"><div className="flex flex-wrap items-center gap-4"><Avatar src={m.avatarUrl} name={m.studentName} size="lg" /><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><RiskBadge level={m.riskLevel} /><Badge tone="default">{m.attemptsCount} attempts</Badge>{m.subjects.map((s) => <Badge key={s} tone="brand" className="text-[10px]">{s}</Badge>)}</div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2"><div><p className="mb-1 flex justify-between text-xs text-fg-muted"><span>Progress</span><span className="text-fg">{m.progressPercent.toFixed(0)}%</span></p><Progress value={m.progressPercent} tone="brand" size="sm" /></div><div><p className="mb-1 flex justify-between text-xs text-fg-muted"><span>Accuracy</span><span className="text-fg">{m.accuracy.toFixed(0)}%</span></p><Progress value={m.accuracy} tone={m.accuracy >= 75 ? 'success' : m.accuracy >= 50 ? 'warning' : 'danger'} size="sm" /></div></div>
    </div></div></Card>
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5"><div className="mb-3 flex items-center gap-2"><Target className="h-4 w-4 text-warning" /><h2 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">Weak topics</h2></div>{m.weakTopics.length === 0 ? <p className="text-sm text-fg-muted">No weak topics identified yet.</p> : <div className="space-y-2">{m.weakTopics.map((t) => <div key={t.topicId} className="flex items-center gap-3"><p className="flex-1 truncate text-sm">{t.topicName}</p><div className="w-24"><Progress value={t.accuracy} tone={t.accuracy >= 50 ? 'warning' : 'danger'} size="sm" /></div><span className="w-10 text-right text-xs text-fg-muted">{t.accuracy.toFixed(0)}%</span></div>)}</div>}</Card>
      <Card className="p-5"><div className="mb-3 flex items-center gap-2"><BookOpen className="h-4 w-4 text-brand-300" /><h2 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">Recent attempts</h2></div>{m.recentAttempts.length === 0 ? <p className="text-sm text-fg-muted">No attempts yet.</p> : <div className="space-y-2">{m.recentAttempts.slice(0, 5).map((a) => <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-bg-elevated/40 px-3 py-2"><div className="min-w-0"><p className="truncate text-sm">{a.title}</p><p className="text-[10px] text-fg-subtle">{a.submittedAt ? formatRelative(a.submittedAt) : 'In progress'}</p></div>{a.status === 'graded' ? <Badge tone="success">{a.score == null ? 'Graded' : `${a.score.toFixed(0)}%`}</Badge> : <Badge tone="brand">Active</Badge>}</div>)}</div>}</Card>
    </div>
    {threads.length > 0 && <div><h2 className="mb-3 text-base font-semibold">Conversations</h2><div className="space-y-1">{threads.map((t) => <Link key={t.id} to={ROUTES.MENTOR.CHAT_THREAD.replace(':threadId', t.id)} className="block"><ThreadListItem thread={t} active={false} onClick={() => undefined} /></Link>)}</div></div>}
  </div>;
}
