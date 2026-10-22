import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, type Control, type UseFormSetValue, type UseFormWatch } from 'react-hook-form';
import { Button, IconButton, Input, Radio } from '@/components/ui';
import type { QuestionFormValues } from '../schemas';

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const;

export interface OptionsEditorProps {
  control: Control<QuestionFormValues>;
  watch: UseFormWatch<QuestionFormValues>;
  setValue: UseFormSetValue<QuestionFormValues>;
}

export function OptionsEditor({ control, watch, setValue }: OptionsEditorProps) {
  const { fields, append, remove, move } = useFieldArray({ control, name: 'options' });
  const correctIndex = watch('correctIndex');

  const handleRemove = (idx: number) => {
    remove(idx);
    if (correctIndex === idx) setValue('correctIndex', -1);
    else if (correctIndex > idx) setValue('correctIndex', correctIndex - 1);
  };

  const handleMove = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= fields.length) return;
    move(idx, target);
    if (correctIndex === idx) setValue('correctIndex', target);
    else if (correctIndex === target) setValue('correctIndex', idx);
  };

  return (
    <div className="space-y-2">
      {fields.map((field, idx) => (
        <div key={field.id} className="flex items-center gap-2">
          <Radio
            name="correctOption"
            checked={correctIndex === idx}
            onChange={() => setValue('correctIndex', idx, { shouldValidate: true })}
            aria-label={`Mark option ${LABELS[idx]} as correct`}
          />
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/5 text-xs font-bold text-fg-muted">
            {LABELS[idx]}
          </div>
          <div className="flex-1">
            <Input
              placeholder={`Option ${LABELS[idx]}`}
              {...control.register(`options.${idx}.text` as const)}
            />
          </div>
          <div className="flex shrink-0">
            <IconButton
              label="Move up"
              size="sm"
              disabled={idx === 0}
              onClick={() => handleMove(idx, -1)}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton
              label="Move down"
              size="sm"
              disabled={idx === fields.length - 1}
              onClick={() => handleMove(idx, 1)}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton
              label="Remove option"
              size="sm"
              tone="danger"
              disabled={fields.length <= 2}
              onClick={() => handleRemove(idx)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </IconButton>
          </div>
        </div>
      ))}

      {fields.length < 5 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          onClick={() => append({ text: '' })}
        >
          Add option
        </Button>
      )}
    </div>
  );
}
