import type { RequestHandler } from 'express';
import { ApiError } from '../../lib/errors.js';
import { validate } from '../../lib/validate.js';
import { getRequestContext } from '../../lib/http.js';
import { initPaymentSchema, webhookProviderParamSchema } from './schemas.js';
import {
  devSimulateForBrowser,
  devSimulateSuccess,
  devSimulateSuccessPublic,
  getStatus,
  handleWebhook,
  initPayment
} from './payments.service.js';
import type { FlowProvider } from './types.js';

export const initPaymentHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = validate(initPaymentSchema, req.body);
  const result = await initPayment(req.user.id, input, getRequestContext(req));
  res.status(201).json(result);
};

export const statusHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  res.json(await getStatus(req.user.id, req.params.orderId));
};

export const webhookHandler: RequestHandler = async (req, res) => {
  const { provider } = validate(webhookProviderParamSchema, req.params);
  await handleWebhook(provider as FlowProvider, req.body);
  // Always 200 for provider callbacks so retries don't spam us.
  res.json({ received: true });
};

/**
 * Dev-only payment simulation.
 *
 * Mounted with `optionalAuth`: the checkout URL is opened with
 * `window.open()`, which cannot send an Authorization header, so an anonymous
 * caller is allowed — but only while NODE_ENV !== 'production' (the route is
 * not mounted at all in production, and the service asserts it again).
 * When a token *is* present the stricter owner check applies.
 */
export const devSimulateHandler: RequestHandler = async (req, res) => {
  if (req.user) {
    await devSimulateSuccess(req.user.id, req.params.orderId);
  } else {
    await devSimulateSuccessPublic(req.params.orderId);
  }
  res.json({ message: 'Simulated success' });
};

// ─── Dev-only HTML confirmation page (GET) ────────────────────────────────

const PAGE_STYLES =
  'body{font-family:system-ui,sans-serif;background:#0b1020;color:#e2e8f0;' +
  'display:grid;place-items:center;min-height:100vh;margin:0;padding:1rem}' +
  '.card{background:#111826;padding:2rem 2.5rem;border-radius:16px;' +
  'border:1px solid #2d3750;text-align:center;max-width:440px}' +
  'h1{font-size:1.25rem;margin:0 0 .5rem}p{color:#94a3b8;font-size:.9rem;line-height:1.5}';

function simulationPage(heading: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${heading}</title><style>${PAGE_STYLES}</style></head>
<body><div class="card"><h1>${heading}</h1><p>${body}</p></div></body></html>`;
}

/**
 * Dev-only GET handler for the simulate-payment URL, so the frontend can open
 * it with `window.open` (which sends no auth headers and issues a GET).
 * Renders a plain HTML confirmation page instead of JSON.
 */
export const devSimulateGetHandler: RequestHandler = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  try {
    const status = await devSimulateForBrowser(req.params.orderId);

    if (status === 'succeeded') {
      res.send(
        simulationPage(
          '✓ Payment simulated',
          'The order is now marked as succeeded. Return to the ExamPrep tab — ' +
            'the modal picks up the status automatically within 3 seconds.'
        )
      );
      return;
    }

    res.send(
      simulationPage(
        `Order is ${status}`,
        'Nothing to simulate — this order has already settled. Start a new ' +
          'payment from the ExamPrep tab to try again.'
      )
    );
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const message = err instanceof ApiError ? err.message : 'Simulation failed';
    res.status(status).send(simulationPage('Simulation unavailable', message));
  }
};
