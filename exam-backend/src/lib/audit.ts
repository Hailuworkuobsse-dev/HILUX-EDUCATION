import { Prisma } from '@prisma/client';
import { prisma } from './prisma.js';
import { logger } from './logger.js';

export type AuditAction =
  | 'user.registered'
  | 'user.login'
  | 'user.logout'
  | 'user.email_verified'
  | 'user.phone_verified'
  | 'user.password_changed'
  | 'user.password_reset_requested'
  | 'user.role_changed'
  | 'user.suspended'
  | 'user.reactivated'
  | 'user.deleted'
  | 'order.refunded'
  | 'order.reconciled'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'content.unpublished'
  | 'content.deleted'
  | 'question.created'
  | 'question.updated'
  | 'question.deleted'
  | 'question.published'
  | 'question.rejected'
  | 'question.archived'
  | 'paper.created'
  | 'paper.updated'
  | 'paper.deleted'
  | 'paper.published'
  | 'paper.rejected'
  | 'paper.archived'
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
