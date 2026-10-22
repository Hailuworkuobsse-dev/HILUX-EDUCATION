import { Router } from 'express';
import { env } from '../../config/env.js';
import { asyncHandler } from '../../lib/async-handler.js';
import { authenticate, optionalAuth } from '../../middleware/auth.js';
import {
  devSimulateGetHandler,
  devSimulateHandler,
  initPaymentHandler,
  statusHandler,
  webhookHandler
} from './payments.controller.js';

export const paymentsRouter = Router();

// ─── Provider webhooks (public) ───────────────────────────────────────────
// Must be registered before authenticate() so providers can reach it without
// a user JWT. Signature verification happens inside handleWebhook via the
// provider adapter (TODO when wiring real providers).
paymentsRouter.post('/webhook/:provider', asyncHandler(webhookHandler));

// ─── Dev-only simulate (not mounted in production) ────────────────────────
// Registered before authenticate() because the dev checkoutUrl is opened with
// window.open(), which cannot carry an Authorization header. GET so the
// browser flow works, POST so `curl -X POST` works too.
if (env.NODE_ENV !== 'production') {
  // GET → HTML confirmation page (what `window.open(checkoutUrl)` lands on)
  paymentsRouter.get(
    '/dev/:orderId/simulate-payment',
    asyncHandler(devSimulateGetHandler)
  );
  // POST → JSON, for `curl -X POST`; keeps the owner check when a token is sent
  paymentsRouter.post(
    '/dev/:orderId/simulate-payment',
    optionalAuth,
    asyncHandler(devSimulateHandler)
  );
}

// ─── Authenticated endpoints ──────────────────────────────────────────────
paymentsRouter.use(authenticate);
paymentsRouter.post('/init', asyncHandler(initPaymentHandler));
paymentsRouter.get('/:orderId/status', asyncHandler(statusHandler));
