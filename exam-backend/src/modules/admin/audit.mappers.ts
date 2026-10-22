import type { AuditLog, User } from '@prisma/client';
import type { AuditLogEntryDTO } from './types.js';

export type AuditWithActor = AuditLog & {
  actor: Pick<User, 'fullName' | 'role'>;
};

export function toAuditDTO(log: AuditWithActor): AuditLogEntryDTO {
  return {
    id: log.id,
    actorId: log.actorId,
    actorName: log.actor.fullName,
    actorRole: log.actor.role,
    action: log.action,
    resourceType: log.resourceType,
    resourceId: log.resourceId,
    meta: (log.meta as Record<string, unknown> | null) ?? null,
    ip: log.ip,
    userAgent: log.userAgent,
    createdAt: log.createdAt.toISOString()
  };
}
