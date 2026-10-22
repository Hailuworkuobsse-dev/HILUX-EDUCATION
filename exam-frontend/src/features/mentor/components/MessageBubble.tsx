import { Avatar } from '@/components/ui';
import type { MentorMessage } from '@/types/mentor';
import { formatRelative } from '@/lib/date';
import { cn } from '@/lib/utils';

export interface MessageBubbleProps {
  message: MentorMessage;
  isMine: boolean;
  showAvatar: boolean;
  showTime: boolean;
}

export function MessageBubble({ message, isMine, showAvatar, showTime }: MessageBubbleProps) {
  return (
    <div className={cn('flex w-full gap-2', isMine ? 'flex-row-reverse' : 'flex-row')}>
      <div className="w-8 shrink-0">
        {showAvatar && !isMine && (
          <Avatar name={message.senderName} size="sm" />
        )}
      </div>
      <div className={cn('flex max-w-[80%] flex-col', isMine ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm',
            isMine
              ? 'rounded-tr-sm bg-brand-500 text-white'
              : 'rounded-tl-sm border border-border bg-bg-elevated text-fg'
          )}
        >
          {message.body}
        </div>
        {showTime && (
          <span className="mt-0.5 px-1 text-[10px] text-fg-subtle">
            {formatRelative(message.createdAt)}
          </span>
        )}
      </div>
    </div>
  );
}
