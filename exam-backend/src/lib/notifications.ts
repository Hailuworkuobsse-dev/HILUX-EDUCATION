import { env } from '../config/env.js';
import { logger } from './logger.js';

// =============================================================================
// Notification delivery.
//
// In dev (or when the provider key is not configured), we log to stdout.
// In production, we call the real providers:
//   • SMS   → Afromessage (https://afromessage.com)
//   • Email → Resend     (https://resend.com)
//
// To wire a different provider, replace the fetch() calls below.
// =============================================================================

const isDev = env.NODE_ENV !== 'production';

async function httpPostJson(url: string, body: unknown, headers: Record<string, string>): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Provider responded ${res.status}: ${text.slice(0, 200)}`);
  }
}

// ─── SMS ──────────────────────────────────────────────────────────────────

export async function sendSms(to: string, body: string): Promise<void> {
  if (isDev || !env.SMS_API_KEY) {
    logger.info({ to, body }, '📱 [DEV] SMS');
    return;
  }

  const url = env.SMS_API_URL ?? 'https://api.afromessage.com/api/send';
  try {
    await httpPostJson(
      url,
      {
        from: env.SMS_FROM_ID,
        to,
        message: body
      },
      { Authorization: `Bearer ${env.SMS_API_KEY}` }
    );
  } catch (err) {
    logger.error({ err, to }, 'SMS delivery failed');
    throw err;
  }
}

// ─── Email ────────────────────────────────────────────────────────────────

export async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<void> {
  if (isDev || !env.EMAIL_API_KEY) {
    logger.info({ to, subject, body }, '📧 [DEV] Email');
    return;
  }

  const url = env.EMAIL_API_URL ?? 'https://api.resend.com/emails';
  try {
    await httpPostJson(
      url,
      {
        from: env.EMAIL_FROM ?? 'noreply@examprep.local',
        to,
        subject,
        text: body
      },
      { Authorization: `Bearer ${env.EMAIL_API_KEY}` }
    );
  } catch (err) {
    logger.error({ err, to, subject }, 'Email delivery failed');
    throw err;
  }
}

// ─── OTP (composite) ──────────────────────────────────────────────────────

export async function sendOtp(
  channel: 'sms' | 'email',
  to: string,
  code: string
): Promise<void> {
  const body = `Your ExamPrep verification code is ${code}. Valid for 10 minutes. Do not share it with anyone.`;
  if (channel === 'sms') {
    await sendSms(to, body);
  } else {
    await sendEmail(to, 'Your ExamPrep verification code', body);
  }
}
