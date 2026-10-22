import type {
  PaymentProvider,
  PaymentStatus,
  Role,
  UserStatus
} from '@prisma/client';

export type AdminUserStatus = UserStatus;

export interface AdminUserDTO {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  status: AdminUserStatus;
  verified: boolean;
  avatarUrl: string | null;
  trialEndsAt: string | null;
  enrollments: number;
  totalSpent: number;
  createdAt: string;
  lastActiveAt: string | null;
}

export interface AdminOrderDTO {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subjectId: string;
  subjectName: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerRef: string | null;
  createdAt: string;
  updatedAt: string;
  refundedAt: string | null;
}

export interface AuditLogEntryDTO {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  resourceType: string;
  resourceId: string | null;
  meta: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AdminUserDetailDTO extends AdminUserDTO {
  bio: string | null;
  grade: number | null;
  school: string | null;
  recentOrders: AdminOrderDTO[];
  recentAuditLogs: AuditLogEntryDTO[];
}

export interface ContentFlagDTO {
  id: string;
  questionId: string;
  questionPrompt: string;
  subjectName: string;
  reason: string;
  description: string;
  flaggedByName: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt: string | null;
  resolution: 'unpublish' | 'delete' | 'keep' | null;
}

export interface PlatformStatsDTO {
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

export interface PaginatedDTO<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
