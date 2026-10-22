import { describe, it, expect } from 'vitest';
import type { Order } from '@prisma/client';
import { adapterFor } from '../src/modules/payments/providers.js';

const fakeOrder = { id: 'order_abc12345', provider: 'chapa' } as Order;

describe('payment provider adapters', () => {
  it('exposes an adapter for every flow provider', () => {
    for (const p of ['telebirr', 'cbe_birr', 'chapa'] as const) {
      expect(adapterFor(p)).toBeDefined();
      expect(typeof adapterFor(p).init).toBe('function');
      expect(typeof adapterFor(p).parseWebhook).toBe('function');
    }
  });

  it('init() returns a dev checkout URL outside production', async () => {
    for (const p of ['telebirr', 'cbe_birr', 'chapa'] as const) {
      const res = await adapterFor(p).init(fakeOrder);
      expect(res.checkoutUrl).toContain('/api/payments/dev/order_abc12345/simulate-payment');
      expect(res.instructions).toContain('Dev mode');
    }
  });

  it('parses the Chapa webhook shape (tx_ref / success)', () => {
    expect(adapterFor('chapa').parseWebhook({ tx_ref: 'tx1', status: 'success' })).toEqual({
      providerRef: 'tx1',
      status: 'succeeded',
      paidAt: undefined
    });
    expect(adapterFor('chapa').parseWebhook({ tx_ref: 'tx1', status: 'failed' })?.status).toBe('failed');
  });

  it('parses the Telebirr / CBE webhook shape (providerRef / succeeded)', () => {
    for (const p of ['telebirr', 'cbe_birr'] as const) {
      expect(adapterFor(p).parseWebhook({ providerRef: 'REF', status: 'succeeded' })?.status).toBe(
        'succeeded'
      );
      expect(adapterFor(p).parseWebhook({ providerRef: 'REF', status: 'anything-else' })?.status).toBe(
        'failed'
      );
    }
  });

  it('carries paidAt through when the provider sends it', () => {
    const parsed = adapterFor('chapa').parseWebhook({
      tx_ref: 'tx1',
      status: 'success',
      paidAt: '2026-01-02T03:04:05.000Z'
    });
    expect(parsed?.paidAt).toBe('2026-01-02T03:04:05.000Z');
  });

  it('returns null for payloads it cannot recognize', () => {
    expect(adapterFor('chapa').parseWebhook(null)).toBeNull();
    expect(adapterFor('chapa').parseWebhook({})).toBeNull();
    expect(adapterFor('chapa').parseWebhook({ status: 'success' })).toBeNull();
    expect(adapterFor('telebirr').parseWebhook({ providerRef: 'x' })).toBeNull();
    expect(adapterFor('telebirr').parseWebhook('not-an-object')).toBeNull();
  });
});
