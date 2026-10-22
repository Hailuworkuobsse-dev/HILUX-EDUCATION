import {
  AlertCircle,
  BarChart3,
  BookOpen,
  FileQuestion,
  LayoutDashboard,
  type LucideIcon,
  MessageSquare,
  ScrollText,
  Settings,
  ShieldCheck,
  Trophy,
  Upload,
  UserCircle,
  Users,
  Wallet
} from 'lucide-react';
import type { Role } from '@/lib/roles';
import { ROUTES } from '@/router/routes';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: number;
}

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  student: [
    { label: 'Dashboard', to: ROUTES.STUDENT.ROOT, icon: LayoutDashboard, end: true },
    { label: 'Courses', to: ROUTES.STUDENT.COURSES, icon: BookOpen },
    { label: 'Practice', to: ROUTES.STUDENT.PRACTICE, icon: BarChart3 },
    { label: 'Results', to: ROUTES.STUDENT.RESULTS, icon: Trophy },
    { label: 'Analytics', to: ROUTES.STUDENT.ANALYTICS, icon: BarChart3 }
  ],
  mentor: [
    { label: 'Dashboard', to: ROUTES.MENTOR.ROOT, icon: LayoutDashboard, end: true },
    { label: 'Mentees', to: ROUTES.MENTOR.MENTEES, icon: Users },
    { label: 'Chat', to: ROUTES.MENTOR.CHAT, icon: MessageSquare },
    { label: 'Reports', to: ROUTES.MENTOR.REPORTS, icon: AlertCircle },
    { label: 'My profile', to: ROUTES.MENTOR.PROFILE, icon: UserCircle }
  ],
  teacher: [
    { label: 'Dashboard', to: ROUTES.TEACHER.ROOT, icon: LayoutDashboard, end: true },
    { label: 'Papers', to: ROUTES.TEACHER.PAPERS, icon: FileQuestion },
    { label: 'Questions', to: ROUTES.TEACHER.QUESTIONS, icon: BookOpen },
    { label: 'Review queue', to: ROUTES.TEACHER.REVIEW, icon: AlertCircle },
    { label: 'Bulk import', to: ROUTES.TEACHER.BULK_IMPORT, icon: Upload }
  ],
  admin: [
    { label: 'Dashboard', to: ROUTES.ADMIN.ROOT, icon: LayoutDashboard, end: true },
    { label: 'Users', to: ROUTES.ADMIN.USERS, icon: Users },
    { label: 'Orders', to: ROUTES.ADMIN.ORDERS, icon: Wallet },
    { label: 'Content', to: ROUTES.ADMIN.CONTENT, icon: ShieldCheck },
    { label: 'Audit log', to: ROUTES.ADMIN.AUDIT, icon: ScrollText }
  ]
};

export const SHARED_NAV: NavItem[] = [
  { label: 'Profile', to: ROUTES.PROFILE, icon: Users },
  { label: 'Settings', to: ROUTES.SETTINGS, icon: Settings }
];
