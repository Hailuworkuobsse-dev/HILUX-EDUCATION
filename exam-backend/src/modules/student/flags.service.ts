import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import type { CreateFlagInput } from './flags.schemas.js';

export interface ContentFlagDTO {
  id: string;
  questionId: string;
  reason: string;
  description: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: string;
}

export async function createFlag(
  reporterId: string,
  input: CreateFlagInput
): Promise<ContentFlagDTO> {
  const question = await prisma.question.findUnique({
    where: { id: input.questionId },
    select: { id: true, status: true }
  });
  if (!question) throw ApiError.notFound('Question not found');
  if (question.status === 'archived') {
    throw ApiError.badRequest('Cannot flag an archived question');
  }

  // Prevent the same user from opening a duplicate flag on the same question.
  const existing = await prisma.contentFlag.findFirst({
    where: {
      questionId: input.questionId,
      reportedById: reporterId,
      status: 'open'
    },
    select: { id: true }
  });
  if (existing) {
    throw ApiError.conflict('You already have an open flag on this question');
  }

  const flag = await prisma.contentFlag.create({
    data: {
      questionId: input.questionId,
      reportedById: reporterId,
      reason: input.reason,
      description: input.description
    }
  });

  return {
    id: flag.id,
    questionId: flag.questionId,
    reason: flag.reason,
    description: flag.description,
    status: flag.status,
    createdAt: flag.createdAt.toISOString()
  };
}
