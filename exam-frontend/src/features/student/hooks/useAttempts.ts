import { useQuery } from '@/hooks/useQuery';
import { useMutation } from '@/hooks/useMutation';
import type { Attempt, AttemptResult } from '@/types/attempt';
import type { StartAttemptPayload } from '@/types/practice';
import { studentApi, type ListAttemptsQuery } from '../api';

export function useAttempt(attemptId: string | undefined) {
  return useQuery<Attempt>(
    () => studentApi.getAttempt(attemptId!),
    [attemptId],
    !!attemptId
  );
}

export function useAttempts(q: ListAttemptsQuery = {}) {
  return useQuery<Attempt[]>(() => studentApi.listAttempts(q), [JSON.stringify(q)]);
}

export function useStartAttempt() {
  return useMutation<Attempt, StartAttemptPayload>((payload) =>
    studentApi.startAttempt(payload)
  );
}

export function useSaveAnswer(attemptId: string) {
  return useMutation<
    { message: string },
    { questionId: string; selectedOptionId: string | null }
  >((vars) => studentApi.saveAnswer(attemptId, vars.questionId, vars.selectedOptionId));
}

export function useSubmitAttempt(attemptId: string) {
  return useMutation<AttemptResult, void>(() => studentApi.submitAttempt(attemptId));
}

export function useAttemptResult(attemptId: string | undefined) {
  return useQuery<AttemptResult>(
    () => studentApi.getAttemptResult(attemptId!),
    [attemptId],
    !!attemptId
  );
}
