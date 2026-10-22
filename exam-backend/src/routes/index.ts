import { Router } from 'express';
import { healthRouter } from './health.js';
import { authRouter } from '../modules/auth/auth.routes.js';
import { contentRouter } from '../modules/student/content.routes.js';
import { studentRouter } from '../modules/student/student.routes.js';
import { mentorRouter } from '../modules/mentor/mentor.routes.js';
import { teacherRouter } from '../modules/teacher/teacher.routes.js';
import { adminRouter } from '../modules/admin/admin.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/', contentRouter);
apiRouter.use('/student', studentRouter);
apiRouter.use('/mentor', mentorRouter);
apiRouter.use('/teacher', teacherRouter);
apiRouter.use('/admin', adminRouter);
