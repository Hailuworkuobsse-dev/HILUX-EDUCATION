import type { Order } from '@prisma/client';
import { env } from '../../config/env.js';
import type { FlowProvider, WebhookPayload } from './types.js';

// =============================================================================
// Provider adapters — dev stubs. Wire real SDKs / HTTP calls before going live.
//
// Each adapter:
//   init()  → returns a checkout URL and/or user instructions
//   parseWebhook() → extracts the payment outcome from a provider callback
//
// This module never touches the DB. Keeping it pure makes tests easy and lets
// the service layer own all state transitions.
// =============================================================================

export interface InitResult {
  checkoutUrl?: string;
  instructions?: string;
  providerRef?: string;
}

interface Adapter {
  init(order: Order): Promise<InitResult>;
  parseWebhook(body: unknown): WebhookPayload | null;
}

const isProd = env.NODE_ENV === 'production';

function devCheckoutUrl(orderId: string): string {
  return `http://localhost:${env.PORT}/api/payments/dev/${orderId}/simulate-payment`;
}

function devInstructions(orderId: string): string {
  return [
    'Dev mode — no real payment is processed.',
    '',
    'Open this URL in your browser to simulate a successful payment',
    '(the payment modal does this for you via the checkout button):',
    `  ${devCheckoutUrl(orderId)}`,
    '',
    'Or from a terminal:',
    `  curl -X POST ${devCheckoutUrl(orderId)}`,
    '',
    'The modal polls /payments/:orderId/status every 3 seconds and flips',
    'to "succeeded" once the simulation succeeds.',
    '',
    'This endpoint is only mounted when NODE_ENV !== "production".'
  ].join('\n');
}

// ─── Telebirr ─────────────────────────────────────────────────────────────

const telebirr: Adapter = {
  async init(order) {
    if (!isProd) {
      return {
        checkoutUrl: devCheckoutUrl(order.id),
        instructions: devInstructions(order.id)
      };
    }
    // TODO: call Telebirr H5 API → returns a payment URL + tradeNo
    throw new Error(
      'Telebirr provider not configured. Add credentials in src/modules/payments/providers.ts (telebirr.init).'
    );
  },
  parseWebhook(body) {
    // TODO: verify Telebirr signature, parse tradeStatus
    // Expected body shape (real): { tradeNo, tradeStatus: 'SUCCESS' | 'FAILED', ... }
    const b = body as { providerRef?: string; status?: string; paidAt?: string } | null;
    if (!b?.providerRef || !b.status) return null;
    return {
      providerRef: b.providerRef,
      status: b.status === 'succeeded' ? 'succeeded' : 'failed',
      paidAt: b.paidAt
    };
  }
};

// ─── CBE Birr ─────────────────────────────────────────────────────────────

const cbeBirr: Adapter = {
  async init(order) {
    if (!isProd) {
      return {
        checkoutUrl: devCheckoutUrl(order.id),
        instructions: devInstructions(order.id)
      };
    }
    // TODO: call CBE Birr merchant API
    throw new Error(
      'CBE Birr provider not configured. Add credentials in src/modules/payments/providers.ts (cbeBirr.init).'
    );
  },
  parseWebhook(body) {
    const b = body as { providerRef?: string; status?: string; paidAt?: string } | null;
    if (!b?.providerRef || !b.status) return null;
    return {
      providerRef: b.providerRef,
      status: b.status === 'succeeded' ? 'succeeded' : 'failed',
      paidAt: b.paidAt
    };
  }
};

// ─── Chapa ────────────────────────────────────────────────────────────────

const chapa: Adapter = {
  async init(order) {
    if (!isProd) {
      return {
        checkoutUrl: devCheckoutUrl(order.id),
        instructions: devInstructions(order.id)
      };
    }
    // TODO: call Chapa initialize transaction → returns { checkout_url, tx_ref }
    throw new Error(
      'Chapa provider not configured. Add credentials in src/modules/payments/providers.ts (chapa.init).'
    );
  },
  parseWebhook(body) {
    // Chapa sends { tx_ref, status: 'success' | 'failed', ... }
    const b = body as { tx_ref?: string; status?: string; paidAt?: string } | null;
    if (!b?.tx_ref || !b.status) return null;
    return {
      providerRef: b.tx_ref,
      status: b.status === 'success' ? 'succeeded' : 'failed',
      paidAt: b.paidAt
    };
  }
};

const ADAPTERS: Record<FlowProvider, Adapter> = {
  telebirr,
  cbe_birr: cbeBirr,
  chapa
};

export function adapterFor(provider: FlowProvider): Adapter {
  return ADAPTERS[provider];
}
