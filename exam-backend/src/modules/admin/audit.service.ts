import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { toAuditDTO } from './audit.mappers.js';
import type { AuditLogEntryDTO, PaginatedDTO } from './types.js';

export interface ListAuditQuery {
  actorId?: string;
  action?: string;
  resourceType?: string;
  search?: string;
  page: number;
  pageSize: number;
}

const ACTOR_INCLUDE = {
  actor: { select: { fullName: true, role: true } }
} satisfies Prisma.AuditLogInclude;

export async function listAudit(
  query: ListAuditQuery
): Promise<PaginatedDTO<AuditLogEntryDTO>> {
  const where: Prisma.AuditLogWhereInput = {};
  if (query.actorId) where.actorId = query.actorId;
  if (query.action) where.action = query.action;
  if (query.resourceType) where.resourceType = query.resourceType;
  if (query.search) {
    where.OR = [
      { action: { contains: query.search } },
      { actor: { fullName: { contains: query.search } } },
      { actor: { email: { contains: query.search } } },
      { resourceId: { contains: query.search } }
    ];
  }

  const skip = (query.page - 1) * query.pageSize;

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: query.pageSize,
      skip,
      include: ACTOR_INCLUDE
    }),
    prisma.auditLog.count({ where })
  ]);

  return {
    items: items.map(toAuditDTO),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize))
  };
}
