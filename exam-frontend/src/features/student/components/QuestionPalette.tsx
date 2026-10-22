import type { Question } from '@/types/question';
import { cn } from '@/lib/utils';

export interface QuestionPaletteProps {
  questions: Question[];
  answers: Record<string, string>;
  marked: Record<string, boolean>;
  currentIndex: number;
  onSelect: (i: number) => void;
}

export function QuestionPalette({
  questions,
  answers,
  marked,
  currentIndex,
  onSelect
}: QuestionPaletteProps) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3 text-[11px] text-fg-muted">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand-500" /> Answered
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-warning" /> Marked
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm border border-border bg-bg-elevated" /> Unanswered
        </span>
      </div>
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
        {questions.map((q, i) => {
          const answered = !!answers[q.id];
          const isMarked = !!marked[q.id];
          const current = i === currentIndex;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelect(i)}
              className={cn(
                'relative flex aspect-square items-center justify-center rounded-lg text-xs font-semibold transition-colors focus-ring',
                current && 'ring-2 ring-brand-400 ring-offset-2 ring-offset-bg-surface',
                answered
                  ? 'bg-brand-500 text-white hover:bg-brand-400'
                  : 'border border-border bg-bg-elevated text-fg-muted hover:bg-white/5'
              )}
            >
              {i + 1}
              {isMarked && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-warning" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
