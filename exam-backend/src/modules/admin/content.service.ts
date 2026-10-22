import { Prisma } from '@prisma/client';
import type { ContentFlag, User } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { writeAudit } from '../../lib/audit.js';
import type { RequestContext } from '../../lib/http.js';
import type { ContentFlagDTO } from './types.js';

// ─── Helpers ──────────────────────────────────────────────────────────────

type FlagWithRelations = ContentFlag & {
  question: { prompt: string; subject: { name: string } };
  reportedBy: Pick<User, 'fullName'>;
};

const FLAG_INCLUDE = {
  question: { select: { prompt: true, subject: { select: { name: true } } } },
  reportedBy: { select: { fullName: true } }
} satisfies Prisma.ContentFlagInclude;

function toFlagDTO(f: FlagWithRelations): ContentFlagDTO {
  return {
    id: f.id,
    questionId: f.questionId,
    questionPrompt: f.question.prompt,
    subjectName: f.question.subject.name,
    reason: f.reason,
    description: f.description,
    flaggedByName: f.reportedBy.fullName,
    status: f.status,
    createdAt: f.createdAt.toISOString(),
    resolvedAt: f.resolvedAt?.toISOString() ?? null,
    resolution: f.resolution
  };
}

// ─── List ─────────────────────────────────────────────────────────────────

export async function listFlags(
  status?: 'open' | 'resolved' | 'dismissed'
): Promise<ContentFlagDTO[]> {
  const flags = await prisma.contentFlag.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: 'desc' },
    include: FLAG_INCLUDE
  });

  return flags.map(toFlagDTO);
}

// ─── Resolve ──────────────────────────────────────────────────────────────

export async function resolveFlag(
  adminId: string,
  flagId: string,
  input: { resolution: 'unpublish' | 'delete' | 'keep'; reason: string },
  ctx: RequestContext
): Promise<ContentFlagDTO> {
  const flag = await prisma.contentFlag.findUnique({
    where: { id: flagId }
  });
  if (!flag) throw ApiError.notFound('Flag not found');
  if (flag.status !== 'open') {
    throw ApiError.badRequest('Flag is already resolved or dismissed');
  }

  await prisma.$transaction(async (tx) => {
    if (input.resolution === 'unpublish') {
      await tx.question.update({
        where: { id: flag.questionId },
        data: { status: 'archived', archivedAt: new Date() }
      });
    } else if (input.resolution === 'delete') {
      await tx.question.delete({ where: { id: flag.questionId } });
    }

    await tx.contentFlag.update({
      where: { id: flagId },
      data: {
        status: input.resolution === 'keep' ? 'dismissed' : 'resolved',
        resolution: input.resolution,
        resolutionNote: input.reason,
        resolvedById: adminId,
        resolvedAt: new Date()
      }
    });
  });

  await writeAudit({
    actorId: adminId,
    action:
      input.resolution === 'delete'
        ? 'content.deleted'
        : input.resolution === 'unpublish'
          ? 'content.unpublished'
          : 'content.flag_resolved', // keep → no destructive action taken
    resourceType: 'content',
    resourceId: flagId,
    meta: {
      resolution: input.resolution,
      questionId: flag.questionId,
      reason: input.reason
    },
    ip: ctx.ip,
    userAgent: ctx.userAgent
  }).catch(() => undefined);

  const updated = await prisma.contentFlag.findUnique({
    where: { id: flagId },
    include: FLAG_INCLUDE
  });
  if (!updated) throw ApiError.notFound('Flag not found after resolution');

  return toFlagDTO(updated);
}
