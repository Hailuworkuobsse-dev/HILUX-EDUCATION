import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { writeAudit } from '../../lib/audit.js';
import type { RequestContext } from '../../lib/http.js';
import { toOrderDTO } from './orders.mappers.js';
import type { AdminOrderDTO, PaginatedDTO } from './types.js';

// ─── List ─────────────────────────────────────────────────────────────────

export interface ListOrdersQuery {
  status?: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  provider?: 'telebirr' | 'cbe_birr' | 'chapa' | 'manual';
  search?: string;
  page: number;
  pageSize: number;
}

export async function listOrders(
  query: ListOrdersQuery
): Promise<PaginatedDTO<AdminOrderDTO>> {
  const where: Prisma.OrderWhereInput = {};
  if (query.status) where.status = query.status;
  if (query.provider) where.provider = query.provider;
  if (query.search) {
    where.OR = [
      { user: { fullName: { contains: query.search } } },
      { user: { email: { contains: query.search } } },
      { subject: { name: { contains: query.search } } }
    ];
  }

  const skip = (query.page - 1) * query.pageSize;

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: query.pageSize,
      skip,
      include: {
        user: { select: { fullName: true, email: true } },
        subject: { select: { name: true } }
      }
    }),
    prisma.order.count({ where })
  ]);

  return {
    items: items.map(toOrderDTO),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize))
  };
}

// ─── Detail ───────────────────────────────────────────────────────────────

export async function getOrder(orderId: string): Promise<AdminOrderDTO> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { fullName: true, email: true } },
      subject: { select: { name: true } }
    }
  });
  if (!order) throw ApiError.notFound('Order not found');
  return toOrderDTO(order);
}

// ─── Refund ───────────────────────────────────────────────────────────────

export async function refundOrder(
  adminId: string,
  orderId: string,
  input: { amount?: number; reason: string },
  ctx: RequestContext
): Promise<AdminOrderDTO> {
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });
  if (!order) throw ApiError.notFound('Order not found');
  if (order.status !== 'succeeded') {
    throw ApiError.badRequest('Only succeeded orders can be refunded');
  }
  if (order.refundedAt) {
    throw ApiError.badRequest('Order has already been refunded');
  }

  const amount = input.amount ?? order.amount;
  if (amount > order.amount) {
    throw ApiError.badRequest('Refund amount exceeds order amount');
  }

  // TODO: call provider refund API here (Telebirr / CBE / Chapa).
  // For MVP, we mark the order as refunded and revoke course access if the
  // refund covers the full amount.
  const isFullRefund = amount >= order.amount;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'refunded',
        refundedAt: new Date(),
        refundedAmount: amount,
        failureReason: `Refunded: ${input.reason}`
      }
    });

    if (isFullRefund) {
      await tx.enrollment.updateMany({
        where: { userId: order.userId, subjectId: order.subjectId },
        data: { status: 'cancelled' }
      });
    }
  });

  await writeAudit({
    actorId: adminId,
    action: 'order.refunded',
    resourceType: 'order',
    resourceId: orderId,
    meta: { amount, fullAmount: isFullRefund, reason: input.reason },
    ip: ctx.ip,
    userAgent: ctx.userAgent
  }).catch(() => undefined);

  return getOrder(orderId);
}

// ─── Reconcile ────────────────────────────────────────────────────────────

export async function reconcileOrder(
  adminId: string,
  orderId: string,
  ctx: RequestContext
): Promise<AdminOrderDTO> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw ApiError.notFound('Order not found');

  const isTerminal =
    order.status === 'succeeded' ||
    order.status === 'failed' ||
    order.status === 'refunded';

  // TODO: in production, poll the provider for the actual status using
  // order.providerRef (adapterFor(order.provider)) and apply markSucceeded /
  // markFailed. For MVP this only records the reconciliation event.
  await writeAudit({
    actorId: adminId,
    action: 'order.reconciled',
    resourceType: 'order',
    resourceId: orderId,
    meta: {
      status: order.status,
      noop: isTerminal,
      note: isTerminal
        ? undefined
        : 'manual reconcile — no provider polling configured'
    },
    ip: ctx.ip,
    userAgent: ctx.userAgent
  }).catch(() => undefined);

  return getOrder(orderId);
}
