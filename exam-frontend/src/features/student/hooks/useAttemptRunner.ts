import { useCallback, useEffect, useState } from 'react';
import { useAttempt, useSaveAnswer, useSubmitAttempt } from './useAttempts';

export interface AttemptRunnerState {
  index: number;
  setIndex: (i: number) => void;
  answers: Record<string, string>;
  setAnswer: (questionId: string, optionId: string) => void;
  marked: Record<string, boolean>;
  toggleMarked: (questionId: string) => void;
}

export function useAttemptRunner(attemptId: string | undefined) {
  const attempt = useAttempt(attemptId);
  const save = useSaveAnswer(attemptId ?? '');
  const submit = useSubmitAttempt(attemptId ?? '');

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!attempt.data || hydrated) return;
    const init: Record<string, string> = {};
    attempt.data.answers.forEach((a) => {
      if (a.selectedOptionId) init[a.questionId] = a.selectedOptionId;
    });
    setAnswers(init);
    setHydrated(true);
  }, [attempt.data, hydrated]);

  // `save.mutate` is stable across renders (useMutation uses refs), so the
  // callback below does not churn on every render.
  const { mutate: saveMutate } = save;

  const setAnswer = useCallback(
    (questionId: string, optionId: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
      saveMutate({ questionId, selectedOptionId: optionId }).catch(() => {
        /* non-blocking — retried on submit */
      });
    },
    [saveMutate]
  );

  const toggleMarked = useCallback((questionId: string) => {
    setMarked((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  }, []);

  const state: AttemptRunnerState = {
    index,
    setIndex,
    answers,
    setAnswer,
    marked,
    toggleMarked
  };

  return { attempt, submit, state };
}
