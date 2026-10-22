import { Check } from 'lucide-react';
import { Badge, Card } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface QuestionPreviewOption {
  id: string;
  label: string;
  text: string;
}

export interface QuestionPreviewProps {
  prompt: string;
  options: QuestionPreviewOption[];
  correctOptionId?: string;
  explanation?: string;
  showAnswer?: boolean;
}

export function QuestionPreview({
  prompt,
  options,
  correctOptionId,
  explanation,
  showAnswer = true
}: QuestionPreviewProps) {
  return (
    <Card className="border-brand-500/20 bg-brand-500/[0.03] p-4 sm:p-5">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-brand-300">
        Student preview
      </p>
      <p className="mb-4 text-sm text-fg">{prompt || 'Your question will appear here…'}</p>
      <div className="space-y-2">
        {options.map((o) => {
          const isCorrect = showAnswer && o.id === correctOptionId;
          return (
            <div
              key={o.id}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-3 text-sm',
                isCorrect
                  ? 'border-success/40 bg-success/5'
                  : 'border-border bg-bg-surface/60'
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold',
                  isCorrect ? 'bg-success text-white' : 'bg-white/5 text-fg-muted'
                )}
              >
                {isCorrect ? <Check className="h-3 w-3" /> : o.label}
              </span>
              <span className="flex-1 text-fg">{o.text || '—'}</span>
            </div>
          );
        })}
      </div>
      {showAnswer && explanation && (
        <div className="mt-3 rounded-xl border border-brand-500/20 bg-bg-elevated/40 p-3 text-xs text-fg-muted">
          <p className="mb-1 font-semibold uppercase tracking-wide text-brand-300">Explanation</p>
          {explanation}
        </div>
      )}
      {options.length > 0 && !correctOptionId && showAnswer && (
        <Badge tone="warning" className="mt-2">
          Mark the correct answer
        </Badge>
      )}
    </Card>
  );
}
