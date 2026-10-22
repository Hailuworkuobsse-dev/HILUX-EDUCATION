import type { ID, ISODate } from './common';

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'grace_period'
  | 'expired'
  | 'cancelled';

/** Mirrors the backend `EnrollmentDTO`. */
export interface CourseEnrollment {
  id: ID;
  userId: ID;
  subjectId: ID;
  status: SubscriptionStatus;
  trialEndsAt: ISODate | null;
  currentPeriodEndsAt: ISODate | null;
  createdAt: ISODate;
}
