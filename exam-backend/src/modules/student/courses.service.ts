import type { Enrollment } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import {
  toPaperDTO,
  toSubjectDTO,
  toTopicDTO
} from './mappers.js';

export interface CourseSummaryDTO {
  id: string;
  slug: string;
  name: string;
  iconKey: string;
  totalPapers: number;
  totalQuestions: number;
  enrolled: boolean;
  trialEndsAt: string | null;
  subscriptionStatus: Enrollment['status'] | 'none';
}

export interface CourseDetailDTO extends CourseSummaryDTO {
  topics: { id: string; subjectId: string; name: string }[];
  papers: ReturnType<typeof toPaperDTO>[];
}

export interface EnrollmentDTO {
  id: string;
  userId: string;
  subjectId: string;
  status: Enrollment['status'];
  trialEndsAt: string | null;
  currentPeriodsEndsAt: string | null;
  createdAt: string;
}

export async function listCourses(userId: string): Promise<CourseSummaryDTO[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { enrollments: true }
  });
  if (!user) throw ApiError.unauthorized();

  const trialActive = !!user.trialEndsAt && user.trialEndsAt.getTime() > Date.now();
  const enrollmentBySubject = new Map<string, Enrollment>(
    user.enrollments.map((e) => [e.subjectId, e])
  );

  const subjects = await prisma.subject.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: {
          papers: { where: { status: 'published' } },
          questions: true
        }
      }
    }
  });

  return subjects.map((s) => {
    const enrollment = enrollmentBySubject.get(s.id);
    const base = toSubjectDTO(s, {
      totalPapers: s._count.papers,
      totalQuestions: s._count.questions
    });

    const subscriptionStatus: CourseSummaryDTO['subscriptionStatus'] = enrollment
      ? enrollment.status
      : trialActive
        ? 'trialing'
        : 'none';

    return {
      ...base,
      enrolled: !!enrollment,
      trialEndsAt: user.trialEndsAt?.toISOString() ?? null,
      subscriptionStatus
    };
  });
}

export async function getCourse(
  userId: string,
  subjectId: string
): Promise<CourseDetailDTO> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { enrollments: { where: { subjectId } } }
  });
  if (!user) throw ApiError.unauthorized();

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      topics: true,
      _count: {
        select: {
          papers: { where: { status: 'published' } },
          questions: true
        }
      },
      papers: {
        where: { status: 'published' },
        orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
        include: { _count: { select: { questions: true } } }
      }
    }
  });
  if (!subject) throw ApiError.notFound('Course not found');

  const enrollment = user.enrollments[0];
  const trialActive = !!user.trialEndsAt && user.trialEndsAt.getTime() > Date.now();
  const subscriptionStatus: CourseSummaryDTO['subscriptionStatus'] = enrollment
    ? enrollment.status
    : trialActive
      ? 'trialing'
      : 'none';

  const base = toSubjectDTO(subject, {
    totalPapers: subject._count.papers,
    totalQuestions: subject._count.questions
  });

  return {
    ...base,
    enrolled: !!enrollment,
    trialEndsAt: user.trialEndsAt?.toISOString() ?? null,
    subscriptionStatus,
    topics: subject.topics.map(toTopicDTO),
    papers: subject.papers.map((p) => toPaperDTO(p, p._count.questions))
  };
}

export async function enrollUser(
  userId: string,
  subjectId: string
): Promise<EnrollmentDTO> {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) throw ApiError.notFound('Course not found');

  const existing = await prisma.enrollment.findUnique({
    where: { userId_subjectId: { userId, subjectId } }
  });
  if (existing) return toEnrollmentDTO(existing);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.unauthorized();

  if (!user.trialEndsAt || user.trialEndsAt.getTime() < Date.now()) {
    throw ApiError.forbidden('Trial has ended. Please subscribe to enroll.');
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      userId,
      subjectId,
      status: 'trialing',
      trialEndsAt: user.trialEndsAt
    }
  });
  return toEnrollmentDTO(enrollment);
}

export function toEnrollmentDTO(e: Enrollment): EnrollmentDTO {
  return {
    id: e.id,
    userId: e.userId,
    subjectId: e.subjectId,
    status: e.status,
    trialEndsAt: e.trialEndsAt?.toISOString() ?? null,
    currentPeriodEndsAt: e.currentPeriodEndsAt?.toISOString() ?? null,
    createdAt: e.createdAt.toISOString()
  };
}