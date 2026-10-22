import { useNavigate, useParams } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, EmptyState, Skeleton } from '@/components/ui';
import { ChatThread, ThreadListItem } from '@/features/mentor/components';
import { useThreads } from '@/features/mentor/hooks';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ROUTES } from '@/router/routes';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const threads = useThreads();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const activeThread = threads.data?.find((t) => t.id === threadId);
  const showList = !threadId || isDesktop;
  const handleSelect = (id: string) => navigate(ROUTES.MENTOR.CHAT_THREAD.replace(':threadId', id));

  return <div className="space-y-4">
    <PageHeader title="Chat" description="Conversations with your mentees." />
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      {showList && <Card className={cn('p-2', !threadId && !isDesktop && 'block')}>
        <div className="border-b border-border px-3 py-2"><p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Conversations</p></div>
        <div className="max-h-[calc(100vh-14rem)] overflow-y-auto p-1">
          {threads.loading ? <div className="space-y-1">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>
            : threads.error ? <div className="space-y-2 p-3"><p className="text-sm font-semibold">Conversations could not be loaded</p><p className="text-xs text-fg-muted">{threads.error.message}</p><Button size="sm" variant="secondary" onClick={threads.reload}>Retry</Button></div>
            : threads.data && threads.data.length > 0 ? threads.data.map((t) => <ThreadListItem key={t.id} thread={t} active={t.id === threadId} onClick={() => handleSelect(t.id)} />)
            : <EmptyState icon={<MessageSquare className="h-6 w-6" />} title="No conversations yet" description="Mentees will reach out soon." />}
        </div>
      </Card>}
      {activeThread ? <ChatThread thread={activeThread} showBack={!isDesktop} onRead={threads.reload} />
        : isDesktop ? <Card className="flex h-[calc(100vh-8rem)] items-center justify-center"><EmptyState icon={<MessageSquare className="h-6 w-6" />} title={threadId && threads.data && !activeThread ? 'Conversation not found' : 'Pick a conversation'} description={threadId && threads.data && !activeThread ? 'This conversation may have been removed or is no longer assigned to you.' : 'Select a mentee to open your chat.'} /></Card>
        : null}
    </div>
  </div>;
}
