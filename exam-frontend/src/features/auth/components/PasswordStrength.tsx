import { Progress } from '@/components/ui/Progress';

type Tone = 'danger' | 'warning' | 'success';

function score(pwd: string): { value: number; label: string; tone: Tone } {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[a-z]/.test(pwd)) s++;
  if (/\d/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;

  if (s <= 2) return { value: Math.max(s * 20, 20), label: 'Weak', tone: 'danger' };
  if (s === 3) return { value: 60, label: 'Fair', tone: 'warning' };
  if (s === 4) return { value: 80, label: 'Good', tone: 'success' };
  return { value: 100, label: 'Strong', tone: 'success' };
}

export function PasswordStrength({ password }: { password: string | undefined }) {
  if (!password) return null;
  const s = score(password);
  const labelClass =
    s.tone === 'success' ? 'text-emerald-300' : s.tone === 'warning' ? 'text-amber-300' : 'text-rose-300';
  return (
    <div className="mt-1.5">
      <Progress value={s.value} tone={s.tone} size="sm" />
      <p className="mt-1 text-xs text-fg-muted">
        Strength: <span className={labelClass}>{s.label}</span>
      </p>
    </div>
  );
}
