import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Avatar, Card, EmptyState, Skeleton } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/lib/api';
import type { MentorMessage, MentorThread } from '@/types/mentor';
import { useThreadMessages } from '../hooks';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { ROUTES } from '@/router/routes';

export interface ChatThreadProps {
  thread: MentorThread;
  showBack?: boolean;
}

export function ChatThread({ thread, showBack }: ChatThreadProps) {
  const { user } = useAuth();
  const toast = useToast();
  const { messages, loading, error, send, sending } = useThreadMessages(thread.id);
  const scrollRef = useRef<HTMLDivElement>(null);

  const grouped = useMemo(() => groupMessages(messages), [messages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const handleSend = async (body: string) => {
    if (!user) return;
    try {
      await send(body, { id: user.id, name: user.fullName });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not send message.';
      toast.error('Message failed', msg);
      throw e;
    }
  };

  return (
    <Card className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden p-0">
      <div className="flex items-center gap-3 border-b border-border p-3">
        {showBack && (
          <Link
            to={ROUTES.MENTOR.CHAT}
            className="rounded-lg p-1.5 text-fg-muted hover:bg-white/5 hover:text-fg"
            aria-label="Back to threads"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        )}
        <Avatar src={thread.menteeAvatarUrl} name={thread.menteeName} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{thread.menteeName}</p>
          <p className="truncate text-xs text-fg-muted">
            {thread.subjectName ?? 'General mentoring'}
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="ml-auto h-8 w-1/2" />
            <Skeleton className="h-8 w-3/5" />
          </div>
        ) : error ? (
          <EmptyState
            icon={<MessageSquare className="h-6 w-6" />}
            title="Couldn't load messages"
            description={error.message}
          />
        ) : messages.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="h-6 w-6" />}
            title="Start the conversation"
            description={`Say hello to ${thread.menteeName}. Ask what they're working on.`}
          />
        ) : (
          <div className="space-y-1.5">
            {grouped.map((g) => (
              <div key={g.id} className="space-y-1.5">
                {g.dateLabel && (
                  <div className="my-3 flex items-center justify-center">
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-fg-subtle">
                      {g.dateLabel}
                    </span>
                  </div>
                )}
                {g.messages.map((m, i) => {
                  const isMine = m.senderId === user?.id;
                  const prev = g.messages[i - 1];
                  const next = g.messages[i + 1];
                  const showAvatar = !prev || prev.senderId !== m.senderId;
                  const showTime = !next || next.senderId !== m.senderId;
                  return (
                    <MessageBubble
                      key={m.id}
                      message={m}
                      isMine={isMine}
                      showAvatar={showAvatar}
                      showTime={showTime}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <MessageComposer
          onSend={handleSend}
          sending={sending}
          disabled={loading}
          placeholder={`Message ${thread.menteeName}…`}
        />
      </div>
    </Card>
  );
}

interface MessageGroup {
  id: string;
  dateLabel: string | null;
  messages: MentorMessage[];
}

function groupMessages(messages: MentorMessage[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  let currentDate: string | null = null;

  messages.forEach((m, i) => {
    const day = m.createdAt.slice(0, 10);
    if (day !== currentDate) {
      currentDate = day;
      groups.push({
        id: `g-${day}-${i}`,
        dateLabel: friendlyDay(m.createdAt),
        messages: [m]
      });
    } else {
      groups[groups.length - 1].messages.push(m);
    }
  });

  return groups;
}

function friendlyDay(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, yest)) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
