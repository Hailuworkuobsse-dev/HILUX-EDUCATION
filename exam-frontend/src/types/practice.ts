import type { ID } from './common';

export interface PracticeConfig {
  subjectId: ID;
  topicIds: ID[];
  questionCount: number;
  mode: 'custom' | 'spaced';
}

export interface StartAttemptPayload {
  paperId?: ID;
  practice?: PracticeConfig;
}
