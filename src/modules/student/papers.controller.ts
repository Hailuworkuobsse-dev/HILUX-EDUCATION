import type { RequestHandler } from 'express';
import { prisma } from '../../lib/prisma.js';
import { toPaperDTO } from './mappers.js';

export const listPapersHandler: RequestHandler = async (req, res) => {
  const { subjectId } = req.query as { subjectId?: string };

  const papers = await prisma.examPaper.findMany({
    where: {
      status: 'published',
      ...(subjectId ? { subjectId } : {})
    },
    orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
    include: { _count: { select: { questions: true } } }
  });

  res.json(papers.map((p) => toPaperDTO(p, p._count.questions)));
};
