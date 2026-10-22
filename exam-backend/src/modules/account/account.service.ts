import type { User } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../lib/errors.js';
import { verifyPassword, hashPassword } from '../../lib/password.js';
import { signExportToken, verifyExportToken } from '../../lib/jwt.js';
import { writeAudit } from '../../lib/audit.js';
import { randomToken } from '../../lib/crypto.js';
import type { RequestContext } from '../../lib/http.js';
import type {
  AccountPreferencesDTO,
  ExportJobDTO
} from './types.js';

// ─── Preferences ──────────────────────────────────────────────────────────

async function loadPrefsOrCreate(userId: string) {
  const existing = await prisma.notificationPreference.findUnique({
    where: { userId }
  });
  if (existing) return existing;
  return prisma.notificationPreference.create({ data: { userId } });
}

export async function getPreferences(userId: string): Promise<AccountPreferencesDTO> {
  const prefs = await loadPrefsOrCreate(userId);
  return {
    notifications: {
      email: prefs.email,
      sms: prefs.sms,
      push: prefs.push
    },
    language: prefs.language,
    timezone: prefs.timezone
  };
}

export interface UpdatePreferencesInput {
  notifications?: { email?: boolean; sms?: boolean; push?: boolean };
  language?: string;
  timezone?: string | null;
}

export async function updatePreferences(
  userId: string,
  input: UpdatePreferencesInput,
  ctx: RequestContext
): Promise<AccountPreferencesDTO> {
  await loadPrefsOrCreate(userId);

  await prisma.notificationPreference.update({
    where: { userId },
    data: {
      ...(input.notifications?.email !== undefined && { email: input.notifications.email }),
      ...(input.notifications?.sms !== undefined && { sms: input.notifications.sms }),
      ...(input.notifications?.push !== undefined && { push: input.notifications.push }),
      ...(input.language !== undefined && { language: input.language }),
      ...(input.timezone !== undefined && { timezone: input.timezone })
    }
  });

  await writeAudit({
    actorId: userId,
    action: 'account.preferences_updated',
    resourceType: 'user',
    resourceId: userId,
    ip: ctx.ip,
    userAgent: ctx.userAgent
  }).catch(() => undefined);

  return getPreferences(userId);
}

// ─── Change password ─────────────────────────────────────────────────────

export async function changePassword(
  user: User,
  input: { currentPassword: string; newPassword: string },
  ctx: RequestContext
): Promise<void> {
  const ok = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!ok) throw ApiError.badRequest('Current password is incorrect');

  const passwordHash = await hashPassword(input.newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    }),
    // Log out everywhere else
    prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() }
    })
  ]);

  await writeAudit({
    actorId: user.id,
    action: 'user.password_changed',
    resourceType: 'user',
    resourceId: user.id,
    ip: ctx.ip,
    userAgent: ctx.userAgent
  }).catch(() => undefined);
}

// ─── Export ───────────────────────────────────────────────────────────────

/**
 * Issues a short-lived (5 min) signed download URL. The browser opens it
 * directly, so it must work without an Authorization header — the signed
 * `type: 'export'` token is what authorizes it.
 */
export async function requestExport(
  user: User,
  ctx: RequestContext
): Promise<ExportJobDTO> {
  const token = signExportToken(user.id, '5m');

  // Set API_PUBLIC_URL in production so the link points at the public host
  // instead of localhost.
  const base =
    env.API_PUBLIC_URL?.replace(/\/$/, '') ?? `http://localhost:${env.PORT}`;

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  await writeAudit({
    actorId: user.id,
    action: 'account.data_exported',
    resourceType: 'user',
    resourceId: user.id,
    ip: ctx.ip,
    userAgent: ctx.userAgent
  }).catch(() => undefined);

  return {
    url: `${base}/api/me/export/download?token=${encodeURIComponent(token)}`,
    expiresAt
  };
}

export async function buildExportBundle(token: string): Promise<{
  userId: string;
  data: Record<string, unknown>;
}> {
  let payload;
  try {
    payload = verifyExportToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired export token');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: {
      enrollments: { include: { subject: { select: { name: true } } } },
      attempts: {
        include: {
          answers: {
            select: {
              questionId: true,
              selectedOptionId: true,
              isCorrect: true
            }
          }
        }
      },
      orders: true
    }
  });
  if (!user) throw ApiError.notFound('User not found');

  // Never ship the hash; keep the relation collections out of `profile` so
  // each dataset appears exactly once in the bundle.
  const {
    passwordHash: _passwordHash,
    enrollments,
    attempts,
    orders,
    ...profile
  } = user;
  void _passwordHash;

  return {
    userId: user.id,
    data: {
      exportedAt: new Date().toISOString(),
      user: profile,
      passwordHash: '[redacted]',
      enrollments,
      attempts,
      orders
    }
  };
}

// ─── Delete account ──────────────────────────────────────────────────────

export async function deleteAccount(
  user: User,
  input: { confirm: 'DELETE'; reason?: string },
  ctx: RequestContext
): Promise<void> {
  if (input.confirm !== 'DELETE') {
    throw ApiError.badRequest('Type DELETE to confirm');
  }

  // Check the account hasn't already been deleted
  if (user.status === 'suspended' && user.email.startsWith('deleted-')) {
    throw ApiError.badRequest('Account has already been deleted');
  }

  const deletedEmail = `deleted-${user.id}@deleted.local`;
  const deletedPhone = `+2519${String(user.id).slice(-8).padStart(8, '0')}`;

  await prisma.$transaction(async (tx) => {
    // Remove PII-heavy content
    await tx.mentorMessage.deleteMany({ where: { senderId: user.id } });
    await tx.attempt.deleteMany({ where: { userId: user.id } });
    await tx.reviewSchedule.deleteMany({ where: { userId: user.id } });
    await tx.enrollment.deleteMany({ where: { userId: user.id } });
    await tx.notificationPreference.deleteMany({ where: { userId: user.id } });
    await tx.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() }
    });

    // Anonymize user row (keeps FK relations intact for mentor messages
    // the user RECEIVED, orders, audit logs, and created content)
    await tx.user.update({
      where: { id: user.id },
      data: {
        email: deletedEmail,
        phone: deletedPhone,
        fullName: 'Deleted User',
        avatarUrl: null,
        bio: null,
        school: null,
        status: 'suspended',
        passwordHash: `deleted-${randomToken(32)}`
      }
    });
  });

  await writeAudit({
    actorId: user.id,
    action: 'account.deleted',
    resourceType: 'user',
    resourceId: user.id,
    meta: { reason: input.reason },
    ip: ctx.ip,
    userAgent: ctx.userAgent
  }).catch(() => undefined);
}
