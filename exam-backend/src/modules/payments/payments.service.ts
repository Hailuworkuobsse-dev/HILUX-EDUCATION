import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { env } from '../../config/env.js';
import { randomToken, sha256 } from '../../lib/crypto.js';
import { writeAudit } from '../../lib/audit.js';
import type { RequestContext } from '../../lib/http.js';
import { adapterFor } from './providers.js';
import type {
  FlowProvider,
  PaymentInitResponseDTO,
  PaymentStatusResponseDTO,
  WebhookPayload
} from './types.js';
import type { InitPaymentInput } from './schemas.js';

// ─── Init ─────────────────────────────────────────────────────────────────

export async function initPayment(
  userId: string,
  input: InitPaymentInput,
  ctx: RequestContext
): Promise<PaymentInitResponseDTO> {
  const subject = await prisma.subject.findUnique({ where: { id: input.subjectId } });
  if (!subject) throw ApiError.notFound('Course not found');

  // Reject if the user already has active access — no double charging.
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_subjectId: { userId, subjectId: input.subjectId } }
  });
  if (enrollment?.status === 'active') {
    throw ApiError.badRequest('You already have access to this course');
  }

  // Idempotency: same (user, subject, provider) in the same 15-min window
  // reuses the existing pending order.
  const windowStart = Math.floor(Date.now() / (15 * 60 * 1000));
  let idempotencyKey = sha256(
    `${userId}:${input.subjectId}:${input.provider}:${windowStart}`
  ).slice(0, 64);

  const existing = await prisma.order.findUnique({
    where: { idempotencyKey }
  });

  if (existing && existing.status === 'pending') {
    const adapter = adapterFor(input.provider as FlowProvider);
    const ad = await adapter.init(existing);
    return {
      orderId: existing.id,
      provider: input.provider as FlowProvider,
      status: 'pending',
      amount: existing.amount,
      currency: existing.currency,
      checkoutUrl: ad.checkoutUrl,
      instructions: ad.instructions
    };
  }

  if (existing) {
    // A terminal order (failed / refunded) already occupies this window's key.
    // Derive a fresh one so the retry can create a new order instead of
    // hitting the unique constraint on idempotencyKey.
    idempotencyKey = sha256(`${idempotencyKey}:${existing.id}:${randomToken(8)}`).slice(0, 64);
  }

  const order = await prisma.order.create({
    data: {
      userId,
      subjectId: input.subjectId,
      amount: env.PRICE_PER_COURSE,
      currency: env.CURRENCY,
      status: 'pending',
      provider: input.provider,
      idempotencyKey
    }
  });

  const adapter = adapterFor(input.provider as FlowProvider);

  let init: { checkoutUrl?: string; instructions?: string; providerRef?: string };
  try {
    init = await adapter.init(order);
  } catch (err) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'failed',
        failureReason: err instanceof Error ? err.message : 'Provider init failed'
      }
    });
    throw err;
  }

  if (init.providerRef) {
    await prisma.order.update({
      where: { id: order.id },
      data: { providerRef: init.providerRef }
    });
  }

  await writeAudit({
    actorId: userId,
    action: 'payment.initiated',
    resourceType: 'order',
    resourceId: order.id,
    meta: { phase: 'init', provider: input.provider, amount: order.amount },
    ip: ctx.ip,
    userAgent: ctx.userAgent
  }).catch(() => undefined);

  return {
    orderId: order.id,
    provider: input.provider as FlowProvider,
    status: 'pending',
    amount: order.amount,
    currency: order.currency,
    checkoutUrl: init.checkoutUrl,
    instructions: init.instructions
  };
}

// ─── Status ───────────────────────────────────────────────────────────────

export async function getStatus(
  userId: string,
  orderId: string
): Promise<PaymentStatusResponseDTO> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      userId: true,
      status: true,
      paidAt: true,
      failureReason: true
    }
  });
  if (!order) throw ApiError.notFound('Order not found');
  // Same 404 for "not yours" so order ids can't be enumerated.
  if (order.userId !== userId) throw ApiError.notFound('Order not found');

  return {
    orderId: order.id,
    status: order.status,
    paidAt: order.paidAt?.toISOString(),
    failureReason: order.failureReason ?? undefined
  };
}

// ─── Webhook (provider → us) ──────────────────────────────────────────────

export async function handleWebhook(
  provider: FlowProvider,
  body: unknown
): Promise<{ received: true }> {
  const adapter = adapterFor(provider);
  const parsed = adapter.parseWebhook(body);
  if (!parsed) throw ApiError.badRequest('Invalid webhook payload');

  const order = await prisma.order.findFirst({
    where: {
      provider,
      OR: [
        { providerRef: parsed.providerRef },
        { id: parsed.providerRef }
      ]
    }
  });
  if (!order) {
    // Providers retry; return 200 anyway with a marker so they don't spam.
    return { received: true };
  }

  if (parsed.status === 'succeeded') {
    await markSucceeded(order.id, parsed);
  } else {
    await markFailed(order.id, parsed.failureReason ?? 'Provider reported failure');
  }

  return { received: true };
}

// ─── Shared transition helpers (also used by dev-simulate) ───────────────

export async function markSucceeded(
  orderId: string,
  payload: Pick<WebhookPayload, 'providerRef' | 'paidAt'>
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order || order.status === 'succeeded') return; // idempotent

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'succeeded',
        paidAt: payload.paidAt ? new Date(payload.paidAt) : new Date(),
        providerRef: payload.providerRef,
        failureReason: null
      }
    });

    await tx.enrollment.upsert({
      where: {
        userId_subjectId: { userId: order.userId, subjectId: order.subjectId }
      },
      update: {
        status: 'active',
        currentPeriodEndsAt: null
      },
      create: {
        userId: order.userId,
        subjectId: order.subjectId,
        status: 'active',
        currentPeriodEndsAt: null
      }
    });
  });

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  await writeAudit({
    actorId: order.userId,
    action: 'payment.succeeded',
    resourceType: 'order',
    resourceId: order.id,
    meta: { provider: order.provider, amount: order.amount }
  }).catch(() => undefined);
}

export async function markFailed(orderId: string, reason: string): Promise<void> {
  const current = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true, status: true, provider: true, amount: true }
  });
  if (!current) return;

  // Never downgrade an order that already reached a successful terminal state —
  // provider callbacks can arrive late or out of order.
  if (current.status === 'succeeded' || current.status === 'refunded') return;

  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'failed', failureReason: reason }
  });

  await writeAudit({
    actorId: current.userId,
    action: 'payment.failed',
    resourceType: 'order',
    resourceId: current.id,
    meta: { provider: current.provider, reason }
  }).catch(() => undefined);
}

// ─── Dev simulate (only used in non-production) ──────────────────────────

/**
 * Authenticated simulation — the caller must own the order.
 */
export async function devSimulateSuccess(
  userId: string,
  orderId: string
): Promise<void> {
  assertNotProduction();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true, status: true }
  });
  if (!order) throw ApiError.notFound('Order not found');
  if (order.userId !== userId) throw ApiError.notFound('Order not found');

  await simulate(order.id, order.status);
}

/**
 * Browser-openable simulation (GET) used by the dev `checkoutUrl`.
 *
 * A `window.open()` cannot carry an Authorization header, so this variant has
 * no owner check — which is why it is only ever mounted outside production
 * (see payments.routes.ts) and re-asserts NODE_ENV here as a second guard.
 */
export async function devSimulateSuccessPublic(orderId: string): Promise<void> {
  assertNotProduction();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true }
  });
  if (!order) throw ApiError.notFound('Order not found');

  await simulate(order.id, order.status);
}

function assertNotProduction(): void {
  if (env.NODE_ENV === 'production') {
    throw ApiError.notFound('Not found');
  }
}

async function simulate(orderId: string, status: string): Promise<void> {
  if (status !== 'pending') {
    throw ApiError.badRequest(`Cannot simulate: order is ${status}`);
  }

  await markSucceeded(orderId, {
    providerRef: `dev-${orderId.slice(0, 8)}`,
    paidAt: new Date().toISOString()
  });
}
