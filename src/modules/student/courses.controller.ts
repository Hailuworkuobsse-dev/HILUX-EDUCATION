import type { RequestHandler } from 'express';
import { ApiError } from '../../lib/errors.js';
import { listCourses, getCourse, enrollUser } from './courses.service.js';

export const listCoursesHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const courses = await listCourses(req.user.id);
  res.json(courses);
};

export const getCourseHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const course = await getCourse(req.user.id, req.params.subjectId);
  res.json(course);
};

export const enrollHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const { subjectId } = req.body as { subjectId?: string };
  if (!subjectId) throw ApiError.badRequest('subjectId is required');
  const enrollment = await enrollUser(req.user.id, subjectId);
  res.status(201).json(enrollment);
};
