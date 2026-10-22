import type { Enrollment } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';

const ALLOWED_STATUSES: Enrollment['status'][] = ['trialing', 'active', 'grace_period'];

export async function assertSubjectAccess(
  userId: string,
  subjectId: string
): Promise<Enrollment> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_subjectId: { userId, subjectId } }
  });

  if (enrollment) {
    if (ALLOWED_STATUSES.includes(enrollment.status)) return enrollment;
    throw ApiError.forbidden('Course access expired. Please subscribe to continue.');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { trialEndsAt: true }
  });
  if (!user) throw ApiError.unauthorized();

  if (!user.trialEndsAt || user.trialEndsAt.getTime() < Date.now()) {
    throw ApiError.forbidden('Trial has ended. Please subscribe to continue.');
  }

  return prisma.enrollment.create({
    data: {
      userId,
      subjectId,
      status: 'trialing',
      trialEndsAt: user.trialEndsAt
    }
  });
}

export async function isSubjectAccessible(
  userId: string,
  subjectId: string
): Promise<boolean> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_subjectId: { userId, subjectId } },
    select: { status: true }
  });
  if (enrollment) return ALLOWED_STATUSES.includes(enrollment.status);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { trialEndsAt: true }
  });
  return !!user?.trialEndsAt && user.trialEndsAt.getTime() > Date.now();
}