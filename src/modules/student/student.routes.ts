import { Router } from 'express';

/**
 * Reserved for student-only endpoints (e.g. profile edits, notification
 * preferences) — currently none. All shared content endpoints live in
 * content.routes.ts and are mounted at the API root.
 */
export const studentRouter = Router();
