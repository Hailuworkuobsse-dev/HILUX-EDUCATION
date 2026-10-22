import { useCallback, useEffect, useRef, useState } from 'react';
import { useAttempt, useSaveAnswer, useSubmitAttempt } from './useAttempts';

export interface AttemptRunnerState {
  index: number;
  setIndex: (i: number) => void;
  answers: Record<string, string>;
  setAnswer: (questionId: string, optionId: string) => void;
  marked: Record<string, boolean>;
  toggleMarked: (questionId: string) => void;
  saveStates: Record<string, 'saving' | 'saved' | 'error'>;
  saveAllAnswers: () => Promise<void>;
}

export function useAttemptRunner(attemptId: string | undefined) {
  const attempt = useAttempt(attemptId);
  const save = useSaveAnswer(attemptId ?? '');
  const submit = useSubmitAttempt(attemptId ?? '');

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [saveStates, setSaveStates] = useState<Record<string, 'saving' | 'saved' | 'error'>>({});
  const [hydrated, setHydrated] = useState(false);
  const saveQueue = useRef<Record<string, Promise<unknown>>>({});
  const latestAnswers = useRef<Record<string, string>>({});
  const { mutate: saveMutate } = save;

  useEffect(() => {
    if (!attempt.data || hydrated) return;
    const init: Record<string, string> = {};
    attempt.data.answers.forEach((a) => {
      if (a.selectedOptionId) init[a.questionId] = a.selectedOptionId;
    });
    latestAnswers.current = init;
    setAnswers(init);
    setHydrated(true);
  }, [attempt.data, hydrated]);

  const queueSave = useCallback((questionId: string, optionId: string) => {
    setSaveStates((prev) => ({ ...prev, [questionId]: 'saving' }));
    const previous = saveQueue.current[questionId] ?? Promise.resolve();
    const operation = previous
      .catch(() => undefined)
      .then(() => saveMutate({ questionId, selectedOptionId: optionId }))
      .then(() => {
        if (latestAnswers.current[questionId] === optionId) {
          setSaveStates((prev) => ({ ...prev, [questionId]: 'saved' }));
        }
      })
      .catch((error: unknown) => {
        if (latestAnswers.current[questionId] === optionId) {
          setSaveStates((prev) => ({ ...prev, [questionId]: 'error' }));
        }
        throw error;
      });
    saveQueue.current[questionId] = operation;
    void operation.finally(() => {
      if (saveQueue.current[questionId] === operation) {
        delete saveQueue.current[questionId];
      }
    }).catch(() => undefined);
    return operation;
  }, [saveMutate]);

  const setAnswer = useCallback((questionId: string, optionId: string) => {
    latestAnswers.current = { ...latestAnswers.current, [questionId]: optionId };
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    void queueSave(questionId, optionId).catch(() => undefined);
  }, [queueSave]);

  const saveAllAnswers = useCallback(async () => {
    const currentAnswers = { ...latestAnswers.current };
    await Promise.all(
      Object.entries(currentAnswers).map(([questionId, optionId]) => queueSave(questionId, optionId))
    );
  }, [queueSave]);

  const toggleMarked = useCallback((questionId: string) => {
    setMarked((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  }, []);

  const state: AttemptRunnerState = {
    index,
    setIndex,
    answers,
    setAnswer,
    marked,
    toggleMarked,
    saveStates,
    saveAllAnswers
  };

  return { attempt, submit, state };
}
