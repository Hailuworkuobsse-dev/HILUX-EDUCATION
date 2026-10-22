import { format, formatDistanceToNow, parseISO, differenceInDays, addDays, isToday } from 'date-fns';

export function formatDate(input: string | Date, pattern = 'PP'): string {
  const d = typeof input === 'string' ? parseISO(input) : input;
  return format(d, pattern);
}

export function formatRelative(input: string | Date): string {
  const d = typeof input === 'string' ? parseISO(input) : input;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function daysBetween(a: Date, b: Date): number {
  return differenceInDays(b, a);
}

export function addDaysTo(input: Date, days: number): Date {
  return addDays(input, days);
}

export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function isExpired(dateISO: string | null | undefined): boolean {
  if (!dateISO) return false;
  return new Date(dateISO).getTime() < Date.now();
}

export { isToday };
