import type { RequestHandler } from 'express';
import { ApiError } from '../../lib/errors.js';
import { validate } from '../../lib/validate.js';
import { getRequestContext } from '../../lib/http.js';
import { listOrdersQuerySchema, refundSchema } from './schemas.js';
import {
  getOrder,
  listOrders,
  reconcileOrder,
  refundOrder
} from './orders.service.js';

export const listOrdersHandler: RequestHandler = async (req, res) => {
  const query = validate(listOrdersQuerySchema, req.query);
  res.json(await listOrders(query));
};

export const getOrderHandler: RequestHandler = async (req, res) => {
  res.json(await getOrder(req.params.orderId));
};

export const refundOrderHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const input = validate(refundSchema, req.body);
  const order = await refundOrder(
    req.user.id,
    req.params.orderId,
    input,
    getRequestContext(req)
  );
  res.json(order);
};

export const reconcileOrderHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const order = await reconcileOrder(
    req.user.id,
    req.params.orderId,
    getRequestContext(req)
  );
  res.json(order);
};
