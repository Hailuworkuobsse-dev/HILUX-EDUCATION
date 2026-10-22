import { prisma } from '../../lib/prisma.js';
import type { PlatformStatsDTO } from './types.js';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function getOverview(): Promise<PlatformStatsDTO> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - WEEK_MS);

  const [
    totalUsers,
    newUsersThisWeek,
    activeStudents,
    activeMentors,
    activeTeachers,
    activeSubscriptions,
    trialingUsers,
    revenueThisMonthAgg,
    revenueLast30Agg,
    ordersPending,
    ordersFailed,
    openFlags
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { role: 'student', status: 'active' } }),
    prisma.user.count({ where: { role: 'mentor', status: 'active' } }),
    prisma.user.count({ where: { role: 'teacher', status: 'active' } }),
    prisma.enrollment.count({ where: { status: 'active' } }),
    prisma.enrollment.count({ where: { status: 'trialing' } }),
    prisma.order.aggregate({
      where: { status: 'succeeded', paidAt: { gte: monthStart } },
      _sum: { amount: true }
    }),
    prisma.order.aggregate({
      where: { status: 'succeeded', paidAt: { gte: last30Days } },
      _sum: { amount: true }
    }),
    prisma.order.count({ where: { status: 'pending' } }),
    prisma.order.count({ where: { status: 'failed' } }),
    prisma.contentFlag.count({ where: { status: 'open' } })
  ]);

  return {
    totalUsers,
    newUsersThisWeek,
    activeStudents,
    activeMentors,
    activeTeachers,
    activeSubscriptions,
    trialingUsers,
    mrr: revenueLast30Agg._sum.amount ?? 0,
    revenueThisMonth: revenueThisMonthAgg._sum.amount ?? 0,
    ordersPending,
    ordersFailed,
    openFlags
  };
}
