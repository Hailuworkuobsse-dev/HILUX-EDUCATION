export const ROLES = ['student', 'mentor', 'teacher', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  student: 'Student',
  mentor: 'Mentor',
  teacher: 'Teacher',
  admin: 'Administrator'
};

/** Landing route per role — used for post-login redirects and role guards. */
export const ROLE_HOME: Record<Role, string> = {
  student: '/student',
  mentor: '/mentor',
  teacher: '/teacher',
  admin: '/admin'
};

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}
