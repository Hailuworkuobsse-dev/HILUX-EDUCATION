import type { RequestHandler } from 'express';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';

export const listSubjectsHandler: RequestHandler = async (_req, res) => {
  const subjects = await prisma.subject.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { papers: { where: { status: 'published' } }, questions: true } }
    }
  });
  res.json(
    subjects.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      iconKey: s.iconKey ?? '',
      totalPapers: s._count.papers,
      totalQuestions: s._count.questions
    }))
  );
};

export const listTopicsHandler: RequestHandler = async (req, res) => {
  const { subjectId } = req.query as { subjectId?: string };
  if (!subjectId) throw ApiError.badRequest('subjectId query parameter is required');

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) throw ApiError.notFound('Subject not found');

  const topics = await prisma.topic.findMany({
    where: { subjectId },
    orderBy: { name: 'asc' }
  });
  res.json(topics.map((t) => ({ id: t.id, subjectId: t.subjectId, name: t.name })));
};