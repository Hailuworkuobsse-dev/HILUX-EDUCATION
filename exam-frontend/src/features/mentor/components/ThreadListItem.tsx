import { Avatar } from '@/components/ui';
import type { MentorThread } from '@/types/mentor';
import { formatRelative } from '@/lib/date';
import { cn } from '@/lib/utils';

export interface ThreadListItemProps {
  thread: MentorThread;
  active: boolean;
  onClick: () => void;
}

export function ThreadListItem({ thread, active, onClick }: ThreadListItemProps) {
  const unread = thread.unreadCount > 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors focus-ring',
        active
          ? 'border-brand-400 bg-brand-500/10'
          : 'border-transparent hover:border-border hover:bg-white/[0.03]'
      )}
    >
      <Avatar src={thread.menteeAvatarUrl} name={thread.menteeName} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold">{thread.menteeName}</p>
          <span className="shrink-0 text-[10px] text-fg-subtle">
            {formatRelative(thread.lastMessageAt)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p
            className={cn(
              'truncate text-xs',
              unread ? 'font-medium text-fg' : 'text-fg-muted'
            )}
          >
            {thread.lastMessagePreview || 'No messages yet'}
          </p>
          {unread && (
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
              {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
            </span>
          )}
        </div>
        {thread.subjectName && (
          <p className="mt-0.5 truncate text-[10px] text-fg-subtle">{thread.subjectName}</p>
        )}
      </div>
    </button>
  );
}
