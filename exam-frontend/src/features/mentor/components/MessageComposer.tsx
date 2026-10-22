import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { IconButton } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface MessageComposerProps {
  onSend: (body: string) => Promise<void> | void;
  disabled?: boolean;
  sending?: boolean;
  placeholder?: string;
}

export function MessageComposer({
  onSend,
  disabled,
  sending,
  placeholder = 'Write a message…'
}: MessageComposerProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow up to a max height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [text]);

  const doSend = async () => {
    const body = text.trim();
    if (!body || disabled || sending) return;
    setText('');
    try {
      await onSend(body);
    } catch {
      // restore text if send failed and it's still empty
      setText((curr) => (curr ? curr : body));
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void doSend();
    }
  };

  return (
    <div className="flex items-end gap-2 rounded-2xl border border-border bg-bg-surface/60 p-2">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={cn(
          'max-h-[140px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-fg placeholder:text-fg-subtle focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-60'
        )}
      />
      <IconButton
        label="Send message"
        tone="brand"
        onClick={doSend}
        disabled={!text.trim() || disabled || sending}
      >
        <Send className="h-4 w-4" />
      </IconButton>
    </div>
  );
}
