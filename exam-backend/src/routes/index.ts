import { Router } from 'express';
import { healthRouter } from './health.js';
import { authRouter } from '../modules/auth/auth.routes.js';
import { contentRouter } from '../modules/student/content.routes.js';
import { studentRouter } from '../modules/student/student.routes.js';
import { mentorRouter } from '../modules/mentor/mentor.routes.js';
import { teacherRouter } from '../modules/teacher/teacher.routes.js';
import { adminRouter } from '../modules/admin/admin.routes.js';
import { paymentsRouter } from '../modules/payments/payments.routes.js';
import { accountRouter } from '../modules/account/account.routes.js';

export const apiRouter = Router();

// ─── Public / auth ────────────────────────────────────────────────────────
apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);

// ─── Role-scoped ──────────────────────────────────────────────────────────
apiRouter.use('/student', studentRouter);
apiRouter.use('/mentor', mentorRouter);
apiRouter.use('/teacher', teacherRouter);
apiRouter.use('/admin', adminRouter);

// ─── Payments ─────────────────────────────────────────────────────────────
apiRouter.use('/payments', paymentsRouter);

// ─── Account settings ─────────────────────────────────────────────────────
apiRouter.use('/me', accountRouter);

// ─── Shared domain routes (auth-gated inside the router) ──────────────────
// Mounted LAST on purpose: contentRouter is mounted at the catch-all '/' and
// starts with `use(authenticate)`, so anything above it would never be reached
// by an unauthenticated caller. That would break the three public step-6
// endpoints — provider webhooks, the signed export download, and the dev
// payment simulator (a browser `window.open` cannot send an Authorization
// header). Its own paths (/subjects, /topics, /courses, /papers, /attempts,
// /analytics, /enrollments) do not collide with the prefixes above.
apiRouter.use('/', contentRouter);
