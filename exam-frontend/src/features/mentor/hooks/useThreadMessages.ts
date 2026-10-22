import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api';
import { useInterval } from '@/hooks/useInterval';
import type { MentorMessage } from '@/types/mentor';
import { mentorApi } from '../api';

const POLL_MS = 5000;

export interface UseThreadMessagesResult {
  messages: MentorMessage[];
  loading: boolean;
  error: ApiError | null;
  send: (body: string, sender: { id: string; name: string }) => Promise<void>;
  sending: boolean;
}

export interface UseThreadMessagesOptions {
  /** Fired after the thread has been marked as read, so callers can refresh
   *  unread counts / thread lists. */
  onRead?: () => void;
}

export function useThreadMessages(
  threadId: string | undefined,
  options: UseThreadMessagesOptions = {}
): UseThreadMessagesResult {
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const lastSeenRef = useRef<string | null>(null);
  const onReadRef = useRef(options.onRead);
  onReadRef.current = options.onRead;

  // Initial load per thread
  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setMessages([]);
    lastSeenRef.current = null;

    mentorApi
      .listMessages(threadId)
      .then((msgs) => {
        if (cancelled) return;
        setMessages(msgs);
        if (msgs.length > 0) lastSeenRef.current = msgs[msgs.length - 1].createdAt;
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof ApiError ? e : new ApiError(0, 'Failed to load messages'));
        setLoading(false);
      });

    // Fire-and-forget mark-as-read
    mentorApi
      .markThreadRead(threadId)
      .then(() => onReadRef.current?.())
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [threadId]);

  // Poll for new messages
  useInterval(
    async () => {
      if (!threadId) return;
      try {
        const since = lastSeenRef.current ?? undefined;
        const incoming = await mentorApi.listMessages(threadId, since);
        if (incoming.length === 0) return;
        setMessages((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          const fresh = incoming.filter((m) => !seen.has(m.id));
          if (fresh.length === 0) return prev;
          const merged = [...prev, ...fresh];
          const latest = merged[merged.length - 1];
          if (latest.createdAt > (lastSeenRef.current ?? '')) {
            lastSeenRef.current = latest.createdAt;
          }
          return merged;
        });
        // Mark any newly received as read
        mentorApi
          .markThreadRead(threadId)
          .then(() => onReadRef.current?.())
          .catch(() => undefined);
      } catch {
        /* silent poll failure */
      }
    },
    threadId ? POLL_MS : null
  );

  const send = useCallback(
    async (body: string, sender: { id: string; name: string }) => {
      if (!threadId) return;
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const optimistic: MentorMessage = {
        id: tempId,
        threadId,
        senderId: sender.id,
        senderName: sender.name,
        senderRole: 'mentor',
        body,
        createdAt: new Date().toISOString(),
        readAt: null
      };
      setMessages((prev) => [...prev, optimistic]);
      setSending(true);
      try {
        const real = await mentorApi.sendMessage(threadId, body);
        setMessages((prev) => prev.map((m) => (m.id === tempId ? real : m)));
        if (real.createdAt > (lastSeenRef.current ?? '')) {
          lastSeenRef.current = real.createdAt;
        }
      } catch (e) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        throw e;
      } finally {
        setSending(false);
      }
    },
    [threadId]
  );

  return { messages, loading, error, send, sending };
}
