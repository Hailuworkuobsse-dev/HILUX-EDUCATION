/**
 * Normalize a phone number to E.164 (`+2519XXXXXXXX`).
 * Accepts 09XXXXXXXX, 9XXXXXXXX, +2519XXXXXXXX, 2519XXXXXXXX.
 * Throws on invalid input.
 */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('251')) return `+${digits}`;
  if (digits.length === 10 && digits.startsWith('0')) return `+251${digits.slice(1)}`;
  if (digits.length === 9 && digits.startsWith('9')) return `+251${digits}`;
  throw new Error(`Invalid Ethiopian phone number: ${input}`);
}

export function tryNormalizePhone(input: string): string | null {
  try {
    return normalizePhone(input);
  } catch {
    return null;
  }
}

export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  if (local.length <= 2) return `${local[0] ?? ''}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}

export function maskPhone(phone: string): string {
  if (phone.length <= 6) return phone;
  return `${phone.slice(0, 5)}***${phone.slice(-5)}`;
}

export function maskTarget(channel: 'sms' | 'email', target: string): string {
  return channel === 'email' ? maskEmail(target) : maskPhone(target);
}
