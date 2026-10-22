import { env } from '../config/env.js';
import { logger } from './logger.js';

// =============================================================================
// Notification delivery â€” dev uses console; prod stubs throw until wired.
// Wire Afromessage/Twilio (SMS) and Resend/SES (email) before going live.
// =============================================================================

export async function sendSms(to: string, body: string): Promise<void> {
  if (env.NODE_ENV !== 'production') {
    logger.info({ to, body }, 'í³± [DEV] SMS');
    return;
  }
  // TODO: wire Afromessage / Twilio / Telebirr SMS in production.
  throw new Error(
    'SMS provider not configured. Wire an SMS provider in src/lib/notifications.ts (sendSms).'
  );
}

export async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<void> {
  if (env.NODE_ENV !== 'production') {
    logger.info({ to, subject, body }, 'í³§ [DEV] Email');
    return;
  }
  // TODO: wire Resend / SES / Nodemailer in production.
  throw new Error(
    'Email provider not configured. Wire an email provider in src/lib/notifications.ts (sendEmail).'
  );
}

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
