import type { Order, Subject, User } from '@prisma/client';
import type { AdminOrderDTO } from './types.js';

export type OrderWithRelations = Order & {
  user: Pick<User, 'fullName' | 'email'>;
  subject: Pick<Subject, 'name'>;
};

export function toOrderDTO(o: OrderWithRelations): AdminOrderDTO {
  return {
    id: o.id,
    userId: o.userId,
    userName: o.user.fullName,
    userEmail: o.user.email,
    subjectId: o.subjectId,
    subjectName: o.subject.name,
    amount: o.amount,
    currency: o.currency,
    status: o.status,
    provider: o.provider,
    providerRef: o.providerRef,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    refundedAt: o.refundedAt?.toISOString() ?? null
  };
}
