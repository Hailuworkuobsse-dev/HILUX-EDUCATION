import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { QuestionWithAnswer } from '@/types/attempt';
import { cn } from '@/lib/utils';

export interface ReviewQuestionProps {
  index: number;
  question: QuestionWithAnswer;
}

export function ReviewQuestion({ index, question }: ReviewQuestionProps) {
  return (
    <div className="rounded-2xl border border-border bg-bg-surface/60 p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-xs font-semibold">
            {index + 1}
          </span>
          <Badge tone={question.isCorrect ? 'success' : question.selectedOptionId ? 'danger' : 'default'}>
            {question.isCorrect ? 'Correct' : question.selectedOptionId ? 'Incorrect' : 'Skipped'}
          </Badge>
          <Badge tone="default">{question.difficulty}</Badge>
        </div>
        {question.isCorrect ? (
          <Check className="h-5 w-5 text-success" />
        ) : (
          <X className="h-5 w-5 text-danger" />
        )}
      </div>

      <p className="mb-4 text-sm text-fg">{question.prompt}</p>

      <div className="space-y-2">
        {question.options.map((opt) => {
          const isCorrect = opt.id === question.correctOptionId;
          const isSelected = opt.id === question.selectedOptionId;
          return (
            <div
              key={opt.id}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-3 text-sm',
                isCorrect
                  ? 'border-success/40 bg-success/5'
                  : isSelected
                    ? 'border-danger/40 bg-danger/5'
                    : 'border-border bg-bg-elevated/40'
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold',
                  isCorrect
                    ? 'bg-success text-white'
                    : isSelected
                      ? 'bg-danger text-white'
                      : 'bg-white/5 text-fg-muted'
                )}
              >
                {opt.label}
              </span>
              <span className="flex-1 text-fg">{opt.text}</span>
              {isSelected && !isCorrect && (
                <span className="text-[10px] uppercase tracking-wide text-danger">Your answer</span>
              )}
              {isCorrect && (
                <span className="text-[10px] uppercase tracking-wide text-success">Correct</span>
              )}
            </div>
          );
        })}
      </div>

      {question.explanation && (
        <div className="mt-4 rounded-xl border border-brand-500/20 bg-brand-500/5 p-3 text-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-300">
            Explanation
          </p>
          <p className="text-fg-muted">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
