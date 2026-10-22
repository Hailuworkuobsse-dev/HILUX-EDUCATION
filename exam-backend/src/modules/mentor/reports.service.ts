import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { toReportDTO } from './mappers.js';
import type { MentorReportDTO, MentorReportStatus } from './types.js';

export async function listReports(
  mentorId: string,
  status?: MentorReportStatus
): Promise<MentorReportDTO[]> {
  const reports = await prisma.mentorReport.findMany({
    where: {
      ...(status ? { status } : {}),
      OR: [{ mentorId }, { mentorId: null }]
    },
    orderBy: { createdAt: 'desc' },
    include: {
      student: { select: { id: true, fullName: true } }
    }
  });

  return reports.map(toReportDTO);
}

export async function updateReportStatus(
  mentorId: string,
  reportId: string,
  status: 'resolved' | 'dismissed'
): Promise<MentorReportDTO> {
  const report = await prisma.mentorReport.findUnique({
    where: { id: reportId },
    include: { student: { select: { id: true, fullName: true } } }
  });
  if (!report) throw ApiError.notFound('Report not found');
  if (report.mentorId && report.mentorId !== mentorId) {
    throw ApiError.forbidden('This report is assigned to another mentor');
  }
  if (report.status !== 'open') {
    throw ApiError.badRequest('Report is already resolved or dismissed');
  }

  const updated = await prisma.mentorReport.update({
    where: { id: reportId },
    data: {
      status,
      mentorId,
      resolvedById: mentorId,
      resolvedAt: new Date()
    },
    include: { student: { select: { id: true, fullName: true } } }
  });

  return toReportDTO(updated);
}
