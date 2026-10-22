import type { ID, ISODate } from './common';
import type { AuthUser } from './auth';

export type UserStatus = 'active' | 'suspended' | 'pending_verification';

/** Full profile — everything the account pages can show about the signed-in user. */
export interface UserProfile extends AuthUser {
  bio: string | null;
  grade: number | null;
  school: string | null;
  languages: string[];
  status: UserStatus;
  lastActiveAt: ISODate | null;
}

/** Aggregate counters shown on admin user rows. */
export interface UserCounts {
  id: ID;
  enrollments: number;
  totalSpent: number;
}
