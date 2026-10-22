import { useState } from 'react';
import { Search } from 'lucide-react';
import { Badge, Button, EmptyState, Input, Modal, Skeleton } from '@/components/ui';
import { useDebounce } from '@/hooks/useDebounce';
import { useTeacherQuestions } from '../hooks';
import type { Question } from '@/types/question';

export interface QuestionPickerModalProps {
  open: boolean;
  onClose: () => void;
  subjectId: string;
  excludeIds: string[];
  onPick: (questions: Question[]) => void;
}

export function QuestionPickerModal({
  open,
  onClose,
  subjectId,
  excludeIds,
  onPick
}: QuestionPickerModalProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Record<string, Question>>({});
  const debounced = useDebounce(search, 300);

  const questions = useTeacherQuestions({
    subjectId: subjectId || undefined,
    status: 'published',
    search: debounced || undefined,
    pageSize: 50
  });

  const toggle = (q: Question) => {
    setSelected((prev) => {
      const copy = { ...prev };
      if (copy[q.id]) delete copy[q.id];
      else copy[q.id] = q;
      return copy;
    });
  };

  const handleConfirm = () => {
    onPick(Object.values(selected));
    setSelected({});
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add questions from bank"
      description={subjectId ? 'Only published questions for this subject are shown.' : 'Pick a subject first.'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={Object.keys(selected).length === 0}>
            Add {Object.keys(selected).length || ''}
          </Button>
        </>
      }
    >
      <Input
        placeholder="Search prompts…"
        leftIcon={<Search className="h-4 w-4" />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="mt-3 max-h-96 space-y-2 overflow-y-auto">
        {questions.loading ? (
          <>
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </>
        ) : !questions.data || questions.data.items.length === 0 ? (
          <EmptyState
            title="No questions found"
            description="Publish some questions for this subject first."
          />
        ) : (
          questions.data.items.map((q) => {
            const isExcluded = excludeIds.includes(q.id);
            const isSelected = !!selected[q.id];
            return (
              <button
                key={q.id}
                type="button"
                disabled={isExcluded}
                onClick={() => toggle(q)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  isExcluded
                    ? 'cursor-not-allowed opacity-40 border-border'
                    : isSelected
                      ? 'border-brand-400 bg-brand-500/10'
                      : 'border-border hover:border-brand-500/40'
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <Badge tone="default">{q.difficulty}</Badge>
                  {isExcluded && <Badge tone="warning">In paper</Badge>}
                </div>
                <p className="line-clamp-2 text-sm">{q.prompt}</p>
              </button>
            );
          })
        )}
      </div>
    </Modal>
  );
}
