import { Prisma } from '@prisma/client';
import { prisma } from './prisma.js';
import { logger } from './logger.js';

export type AuditAction =
  // Auth
  | 'user.registered'
  | 'user.login'
  | 'user.logout'
  | 'user.email_verified'
  | 'user.phone_verified'
  | 'user.password_changed'
  | 'user.password_reset_requested'
  // Admin: user management
  | 'user.role_changed'
  | 'user.suspended'
  | 'user.reactivated'
  | 'user.password_reset_by_admin'
  | 'user.deleted'
  // Admin: orders / payments
  | 'order.refunded'
  | 'order.reconciled'
  | 'payment.initiated'
  | 'payment.succeeded'
  | 'payment.failed'
  // Admin: content moderation
  | 'content.unpublished'
  | 'content.deleted'
  | 'content.flag_resolved'
  // Teacher: questions
  | 'question.created'
  | 'question.updated'
  | 'question.deleted'
  | 'question.published'
  | 'question.rejected'
  | 'question.archived'
  // Teacher: papers
  | 'paper.created'
  | 'paper.updated'
  | 'paper.deleted'
  | 'paper.published'
  | 'paper.rejected'
  | 'paper.archived'
  // Account
  | 'account.preferences_updated'
  | 'account.data_exported'
  | 'account.deleted'
  // Roles
  | 'role.permission_changed';

export interface AuditParams {
  actorId: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  meta?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

/**
 * Best-effort audit log write. Never throws — a logging failure must not
 * break the request it is trying to log.
 */
export async function writeAudit(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId ?? null,
        meta: (params.meta ?? undefined) as Prisma.InputJsonValue | undefined,
        ip: params.ip ?? null,
        userAgent: params.userAgent ?? null
      }
    });
  } catch (err) {
    logger.error({ err, action: params.action }, 'Failed to write audit log');
  }
}
