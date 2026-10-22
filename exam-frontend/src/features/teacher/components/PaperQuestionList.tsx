import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, type Control } from 'react-hook-form';
import { Badge, Button, IconButton } from '@/components/ui';
import type { PaperFormValues } from '../schemas';

export interface PaperQuestionListProps {
  control: Control<PaperFormValues>;
  onAddClick: () => void;
  disabled?: boolean;
}

export function PaperQuestionList({ control, onAddClick, disabled }: PaperQuestionListProps) {
  const { fields, remove, move } = useFieldArray({ control, name: 'questions' });

  const handleMove = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= fields.length) return;
    move(idx, target);
  };

  return (
    <div className="space-y-2">
      {fields.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-fg-muted">
          No questions yet. Add questions from the bank.
        </p>
      ) : (
        fields.map((f, idx) => (
          <div
            key={f.id}
            className="flex items-center gap-2 rounded-lg border border-border bg-bg-elevated/40 p-2"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/5 text-xs font-semibold">
              {idx + 1}
            </span>
            <p className="line-clamp-1 flex-1 text-sm">{f.prompt}</p>
            <Badge tone="default" className="shrink-0">
              {f.difficulty}
            </Badge>
            <div className="flex shrink-0">
              <IconButton label="Move up" size="sm" disabled={disabled || idx === 0} onClick={() => handleMove(idx, -1)}>
                <ArrowUp className="h-3.5 w-3.5" />
              </IconButton>
              <IconButton label="Move down" size="sm" disabled={disabled || idx === fields.length - 1} onClick={() => handleMove(idx, 1)}>
                <ArrowDown className="h-3.5 w-3.5" />
              </IconButton>
              <IconButton label="Remove" size="sm" tone="danger" disabled={disabled} onClick={() => remove(idx)}>
                <Trash2 className="h-3.5 w-3.5" />
              </IconButton>
            </div>
          </div>
        ))
      )}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={disabled}
        leftIcon={<Plus className="h-3.5 w-3.5" />}
        onClick={onAddClick}
      >
        Add questions
      </Button>
    </div>
  );
}
