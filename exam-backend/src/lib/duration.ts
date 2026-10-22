/**
 * Convert a duration expression like "15m", "30d", "900s" into milliseconds.
 * A bare number is treated as seconds.
 */
export function durationToMs(expr: string): number {
  const m = /^(\d+)([smhd])?$/.exec(expr.trim());
  if (!m) throw new Error(`Invalid duration expression: ${expr}`);
  const n = parseInt(m[1], 10);
  const unit = (m[2] ?? 's') as 's' | 'm' | 'h' | 'd';
  const mult: Record<typeof unit, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000
  };
  return n * mult[unit];
}

export function durationToSeconds(expr: string): number {
  return Math.floor(durationToMs(expr) / 1000);
}
