export interface QuestionDTO {
  id: string;
  subjectId: string;
  topicId: string;
  paperId: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  year: number | null;
  language: string;
  prompt: string;
  options: { id: string; label: string; text: string }[];
  correctOptionId: string | null;
  explanation: string | null;
  status: 'draft' | 'review' | 'published' | 'archived';
  createdBy: string;
  reviewedBy: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttemptAnswerDTO {
  questionId: string;
  selectedOptionId: string | null;
  timeSpentMs: number;
  isCorrect?: boolean;
}

export interface AttemptDTO {
  id: string;
  userId: string;
  paperId: string | null;
  subjectId: string;
  subjectName: string;
  title: string;
  mode: 'paper' | 'practice' | 'spaced';
  status: 'in_progress' | 'submitted' | 'graded' | 'abandoned';
  startedAt: string;
  submittedAt: string | null;
  durationMinutes: number | null;
  totalQuestions: number;
  questions: QuestionDTO[];
  answers: AttemptAnswerDTO[];
  score: number | null;
  correctCount: number | null;
}

export interface AttemptResultDTO {
  attempt: AttemptDTO;
  questionsWithAnswers: (QuestionDTO & {
    selectedOptionId: string | null;
    isCorrect: boolean;
    timeSpentMs: number;
  })[];
  breakdown: { topicId: string; topicName: string; correct: number; total: number }[];
}