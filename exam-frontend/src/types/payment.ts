import type { ID, ISODate } from './common';
import type { PaymentProvider } from '@/lib/constants';

export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';

/**
 * The order shape the payment flow works with. The admin console uses the
 * richer `AdminOrder` (see @/types/admin), which adds the buyer and subject.
 */
export interface PaymentOrder {
  id: ID;
  userId: ID;
  subjectId: ID;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerRef: string | null;
  failureReason?: string | null;
  paidAt: ISODate | null;
  refundedAt: ISODate | null;
  refundedAmount: number | null;
  createdAt: ISODate;
  updatedAt: ISODate;
}
