import type { RequestHandler } from 'express';
import { ApiError } from '../../lib/errors.js';
import { validate } from '../../lib/validate.js';
import { getRequestContext } from '../../lib/http.js';
import { initPaymentSchema, webhookProviderParamSchema } from './schemas.js';
import {
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
