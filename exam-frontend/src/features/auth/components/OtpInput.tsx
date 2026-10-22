import { useRef, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

export interface OtpInputProps {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  error,
  disabled,
  autoFocus
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) return;
    const next = value.split('');
    while (next.length < length) next.push('');
    next[i] = raw.slice(-1);
    onChange(next.join('').slice(0, length));
    if (i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (value[i]) {
        onChange(value.slice(0, i) + value.slice(i + 1));
      } else if (i > 0) {
        onChange(value.slice(0, i - 1) + value.slice(i));
        refs.current[i - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, length - 1);
    refs.current[focusIdx]?.focus();
  };

  return (
    <div>
      <div className="flex justify-center gap-2">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            autoFocus={autoFocus && i === 0}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            maxLength={1}
            value={value[i] ?? ''}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKey(i, e)}
            onPaste={handlePaste}
            disabled={disabled}
            aria-label={`Digit ${i + 1}`}
            className={cn(
              'h-12 w-11 rounded-xl border bg-bg-surface/60 text-center text-lg font-semibold text-fg focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30',
              error ? 'border-danger' : 'border-border',
              'disabled:opacity-60'
            )}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-center text-xs text-danger">{error}</p>}
    </div>
  );
}
