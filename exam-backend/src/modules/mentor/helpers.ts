import { Prisma } from '@prisma/client';

export function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string');
  return [];
}

export function toJsonInput(arr: string[] | undefined): Prisma.InputJsonValue | undefined {
  if (arr === undefined) return undefined;
  return arr as unknown as Prisma.InputJsonValue;
}

export function computeRisk(accuracy: number, answered: number): 'low' | 'medium' | 'high' {
  if (answered === 0) return 'high';
  if (accuracy >= 70) return 'low';
  if (accuracy >= 50) return 'medium';
  return 'high';
}

export function computeProgressPercent(answered: number): number {
  return Math.min(100, Math.round((answered / 200) * 100));
}

export function truncateBody(body: string, max = 80): string {
  const cleaned = body.replace(/\s+/g, ' ').trim();
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned;
}

export function senderRoleFor(userRole: string): 'student' | 'mentor' {
  return userRole === 'student' ? 'student' : 'mentor';
}
