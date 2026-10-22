import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { writeAudit } from '../../lib/audit.js';
import { randomToken, sha256 } from '../../lib/crypto.js';
import type { RequestContext } from '../../lib/http.js';
import { toAuditDTO } from './audit.mappers.js';
import { toOrderDTO } from './orders.mappers.js';
import type {
  AdminUserDTO,
  AdminUserDetailDTO,
  PaginatedDTO
} from './types.js';

// ─── Helpers ──────────────────────────────────────────────────────────────

type UserWithSpend = Prisma.UserGetPayload<{
  include: {
    enrollments: { select: { id: true; status: true } };
    _count: { select: { enrollments: true } };
    orders: { select: { amount: true; status: true } };
  };
}>;

const USER_INCLUDE = {
  enrollments: { select: { id: true, status: true } },
  _count: { select: { enrollments: true } },
  orders: { select: { amount: true, status: true } }
} satisfies Prisma.UserInclude;

function toAdminUserDTO(u: UserWithSpend): AdminUserDTO {
  const totalSpent = u.orders
    .filter((o) => o.status === 'succeeded')
    .reduce((sum, o) => sum + o.amount, 0);

  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.status,
    verified: u.emailVerified || u.phoneVerified,
    avatarUrl: u.avatarUrl,
    trialEndsAt: u.trialEndsAt?.toISOString() ?? null,
    enrollments: u._count.enrollments,
    totalSpent,
    createdAt: u.createdAt.toISOString(),
    lastActiveAt: u.lastActiveAt?.toISOString() ?? null
  };
}

async function getUserDTO(userId: string): Promise<AdminUserDTO> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: USER_INCLUDE
  });
  if (!user) throw ApiError.notFound('User not found');
  return toAdminUserDTO(user);
}

// ─── List ─────────────────────────────────────────────────────────────────

export interface ListUsersQuery {
  role?: 'student' | 'mentor' | 'teacher' | 'admin';
  status?: 'active' | 'suspended' | 'pending_verification';
  search?: string;
  page: number;
  pageSize: number;
}

export async function listUsers(
  query: ListUsersQuery
): Promise<PaginatedDTO<AdminUserDTO>> {
  const where: Prisma.UserWhereInput = {};
  if (query.role) where.role = query.role;
  if (query.status) where.status = query.status;
  if (query.search) {
    where.OR = [
      { fullName: { contains: query.search } },
      { email: { contains: query.search } },
      { phone: { contains: query.search } }
    ];
  }

  const skip = (query.page - 1) * query.pageSize;

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: query.pageSize,
      skip,
      include: USER_INCLUDE
    }),
    prisma.user.count({ where })
  ]);

  return {
    items: items.map(toAdminUserDTO),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize))
  };
}

// ─── Detail ───────────────────────────────────────────────────────────────

export async function getUser(userId: string): Promise<AdminUserDetailDTO> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: USER_INCLUDE
  });
  if (!user) throw ApiError.notFound('User not found');

  const recentOrders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      user: { select: { fullName: true, email: true } },
      subject: { select: { name: true } }
    }
  });

  const recentAuditLogs = await prisma.auditLog.findMany({
    where: {
      OR: [{ actorId: userId }, { resourceId: userId, resourceType: 'user' }]
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { actor: { select: { fullName: true, role: true } } }
  });

  return {
    ...toAdminUserDTO(user),
    bio: user.bio,
    grade: user.grade,
    school: user.school,
    recentOrders: recentOrders.map(toOrderDTO),
    recentAuditLogs: recentAuditLogs.map(toAuditDTO)
  };
}

// ─── Change role ──────────────────────────────────────────────────────────

export async function changeRole(
  adminId: string,
  userId: string,
  input: { role: 'student' | 'mentor' | 'teacher' | 'admin'; reason?: string },
  ctx: RequestContext
): Promise<AdminUserDTO> {
  if (adminId === userId) {
    throw ApiError.badRequest('You cannot change your own role');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === input.role) {
    throw ApiError.badRequest('User already has this role');
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { role: input.role }
    });

    if (input.role === 'mentor') {
      await tx.mentorProfile.upsert({
        where: { userId },
        update: {},
        create: { userId }
      });
    }
  });

  await writeAudit({
    actorId: adminId,
    action: 'user.role_changed',
    resourceType: 'user',
    resourceId: userId,
    meta: { from: user.role, to: input.role, reason: input.reason },
    ip: ctx.ip,
    userAgent: ctx.userAgent
  }).catch(() => undefined);

  return getUserDTO(userId);
}

// ─── Change status ────────────────────────────────────────────────────────

export async function changeStatus(
  adminId: string,
  userId: string,
  input: { status: 'active' | 'suspended' | 'pending_verification'; reason: string },
  ctx: RequestContext
): Promise<AdminUserDTO> {
  if (adminId === userId) {
    throw ApiError.badRequest('You cannot change your own status');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');

  await prisma.user.update({
    where: { id: userId },
    data: { status: input.status }
  });

  // Revoke all active sessions on suspension
  if (input.status === 'suspended') {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  const action: 'user.suspended' | 'user.reactivated' =
    input.status === 'suspended' ? 'user.suspended' : 'user.reactivated';

  await writeAudit({
    actorId: adminId,
    action,
    resourceType: 'user',
    resourceId: userId,
    meta: { from: user.status, to: input.status, reason: input.reason },
    ip: ctx.ip,
    userAgent: ctx.userAgent
  }).catch(() => undefined);

  return getUserDTO(userId);
}

// ─── Reset password (admin) ──────────────────────────────────────────────

export async function resetUserPassword(
  adminId: string,
  userId: string,
  ctx: RequestContext
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');

  // Create a password reset token valid for 1 hour (admin can hand it to the user)
  const token = randomToken(32);
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    }
  });

  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() }
  });

  await writeAudit({
    actorId: adminId,
    action: 'user.password_reset_by_admin',
    resourceType: 'user',
    resourceId: userId,
    meta: { tokenIssued: true },
    ip: ctx.ip,
    userAgent: ctx.userAgent
  }).catch(() => undefined);
}
