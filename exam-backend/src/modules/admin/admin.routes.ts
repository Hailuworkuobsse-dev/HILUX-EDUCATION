import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/require-role.js';

import { overviewHandler } from './overview.controller.js';
import {
  changeRoleHandler,
  changeStatusHandler,
  getUserHandler,
  listUsersHandler,
  resetPasswordHandler
} from './users.controller.js';
import {
  getOrderHandler,
  listOrdersHandler,
  reconcileOrderHandler,
  refundOrderHandler
} from './orders.controller.js';
import {
  listFlagsHandler,
  resolveFlagHandler
} from './content.controller.js';
import { listAuditHandler } from './audit.controller.js';

export const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(requireRole('admin'));

// ─── Overview ─────────────────────────────────────────────────────────────
adminRouter.get('/overview', asyncHandler(overviewHandler));

// ─── Users ────────────────────────────────────────────────────────────────
adminRouter.get('/users', asyncHandler(listUsersHandler));
adminRouter.get('/users/:userId', asyncHandler(getUserHandler));
adminRouter.patch('/users/:userId/role', asyncHandler(changeRoleHandler));
adminRouter.patch('/users/:userId/status', asyncHandler(changeStatusHandler));
adminRouter.post('/users/:userId/reset-password', asyncHandler(resetPasswordHandler));

// ─── Orders ───────────────────────────────────────────────────────────────
adminRouter.get('/orders', asyncHandler(listOrdersHandler));
adminRouter.get('/orders/:orderId', asyncHandler(getOrderHandler));
adminRouter.post('/orders/:orderId/refund', asyncHandler(refundOrderHandler));
adminRouter.post('/orders/:orderId/reconcile', asyncHandler(reconcileOrderHandler));

// ─── Content moderation ───────────────────────────────────────────────────
adminRouter.get('/content/flags', asyncHandler(listFlagsHandler));
adminRouter.post('/content/flags/:flagId/resolve', asyncHandler(resolveFlagHandler));

// ─── Audit log ────────────────────────────────────────────────────────────
adminRouter.get('/audit', asyncHandler(listAuditHandler));
