import type { ID, ISODate, Paginated } from './common';
import type { Role } from '@/lib/roles';
import type { PaymentProvider } from '@/lib/constants';
import type { PaymentStatus } from './payment';

export type AdminUserStatus = 'active' | 'suspended' | 'pending_verification';

export interface AdminUser {
  id: ID;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  status: AdminUserStatus;
  verified: boolean;
  avatarUrl: string | null;
  trialEndsAt: ISODate | null;
  enrollments: number;
  totalSpent: number;
  createdAt: ISODate;
  lastActiveAt: ISODate | null;
}

export interface AdminUserDetail extends AdminUser {
  bio: string | null;
  grade: number | null;
  school: string | null;
  recentOrders: AdminOrder[];
  recentAuditLogs: AuditLogEntry[];
}

export interface AdminUserFilter {
  role?: Role;
  status?: AdminUserStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminOrder {
  id: ID;
  userId: ID;
  userName: string;
  userEmail: string;
  subjectId: ID;
  subjectName: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerRef: string | null;
  createdAt: ISODate;
  updatedAt: ISODate;
  refundedAt: ISODate | null;
}

export interface AdminOrderFilter {
  status?: PaymentStatus;
  provider?: PaymentProvider;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PlatformStats {
  totalUsers: number;
  newUsersThisWeek: number;
  activeStudents: number;
  activeMentors: number;
  activeTeachers: number;
  activeSubscriptions: number;
  trialingUsers: number;
  mrr: number;
  revenueThisMonth: number;
  ordersPending: number;
  ordersFailed: number;
  openFlags: number;
}

export type ContentFlagStatus = 'open' | 'resolved' | 'dismissed';
export type ContentFlagResolution = 'unpublish' | 'delete' | 'keep';

export interface ContentFlag {
  id: ID;
  questionId: ID;
  questionPrompt: string;
  subjectName: string;
  reason: string;
  description: string;
  flaggedByName: string;
  status: ContentFlagStatus;
  createdAt: ISODate;
  resolvedAt: ISODate | null;
  resolution: ContentFlagResolution | null;
}

export interface AuditLogEntry {
  id: ID;
  actorId: ID;
  actorName: string;
  actorRole: Role;
  action: string;
  resourceType: string;
  resourceId: ID | null;
  meta: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: ISODate;
}

export interface AuditLogFilter {
  actorId?: ID;
  action?: string;
  resourceType?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export type AdminUsersPage = Paginated<AdminUser>;
export type AdminOrdersPage = Paginated<AdminOrder>;
export type AuditLogPage = Paginated<AuditLogEntry>;

export const ADMIN_AUDIT_ACTIONS = [
  'user.role_changed',
  'user.suspended',
  'user.reactivated',
  'user.password_reset',
  'user.deleted',
  'order.refunded',
  'order.reconciled',
  'payment.succeeded',
  'payment.failed',
  'content.unpublished',
  'content.deleted',
  'question.published',
  'question.archived',
  'paper.published',
  'paper.archived',
  'role.permission_changed'
] as const;
export type AdminAuditAction = (typeof ADMIN_AUDIT_ACTIONS)[number];
