export const ROLES = ['student', 'mentor', 'teacher', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  'practice.attempt',
  'practice.review',
  'course.view',
  'course.purchase',
  'mentor.view_mentees',
  'mentor.reply',
  'mentor.report',
  'question.create',
  'question.edit',
  'question.publish',
  'question.archive',
  'paper.create',
  'paper.edit',
  'paper.publish',
  'payment.view_own',
  'payment.manage',
  'user.view',
  'user.manage',
  'role.manage',
  'audit.view',
  'analytics.platform',
  'content.moderate'
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  student: [
    'practice.attempt',
    'practice.review',
    'course.view',
    'course.purchase',
    'mentor.report',
    'payment.view_own'
  ],
  mentor: [
    'practice.attempt',
    'practice.review',
    'course.view',
    'mentor.view_mentees',
    'mentor.reply',
    'mentor.report',
    'payment.view_own'
  ],
  teacher: [
    'question.create',
    'question.edit',
    'question.publish',
    'question.archive',
    'paper.create',
    'paper.edit',
    'paper.publish',
    'content.moderate',
    'mentor.report'
  ],
  admin: [...PERMISSIONS]
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}
