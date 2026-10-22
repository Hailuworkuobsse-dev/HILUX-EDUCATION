import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LoadingScreen } from '@/components/feedback/LoadingScreen';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { RoleGuard } from './RoleGuard';
import { ROUTES } from './routes';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const VerifyOtpPage = lazy(() => import('@/pages/auth/VerifyOtpPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const UnauthorizedPage = lazy(() => import('@/pages/shared/UnauthorizedPage'));
const TermsPage = lazy(() => import('@/pages/shared/TermsPage'));
const PrivacyPage = lazy(() => import('@/pages/shared/PrivacyPage'));
const SupportPage = lazy(() => import('@/pages/shared/SupportPage'));
const NotFoundPage = lazy(() =>
  import('@/components/feedback/NotFound').then((m) => ({ default: m.NotFound }))
);
const ProfilePage = lazy(() => import('@/pages/shared/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/shared/SettingsPage'));

const StudentDashboard = lazy(() => import('@/pages/student/StudentDashboard'));
const CoursesPage = lazy(() => import('@/pages/student/CoursesPage'));
const CourseDetailPage = lazy(() => import('@/pages/student/CourseDetailPage'));
const PracticeSetupPage = lazy(() => import('@/pages/student/PracticeSetupPage'));
const AttemptPage = lazy(() => import('@/pages/student/AttemptPage'));
const AttemptResultPage = lazy(() => import('@/pages/student/AttemptResultPage'));
const ResultsPage = lazy(() => import('@/pages/student/ResultsPage'));
const AnalyticsPage = lazy(() => import('@/pages/student/AnalyticsPage'));
const SubscribePage = lazy(() => import('@/pages/student/SubscribePage'));

const MentorDashboard = lazy(() => import('@/pages/mentor/MentorDashboard'));
const MenteesPage = lazy(() => import('@/pages/mentor/MenteesPage'));
const MenteeDetailPage = lazy(() => import('@/pages/mentor/MenteeDetailPage'));
const ChatPage = lazy(() => import('@/pages/mentor/ChatPage'));
const ReportsPage = lazy(() => import('@/pages/mentor/ReportsPage'));
const MentorProfilePage = lazy(() => import('@/pages/mentor/MentorProfilePage'));

const TeacherDashboard = lazy(() => import('@/pages/teacher/TeacherDashboard'));
const PapersPage = lazy(() => import('@/pages/teacher/PapersPage'));
const PaperFormPage = lazy(() => import('@/pages/teacher/PaperFormPage'));
const PaperDetailPage = lazy(() => import('@/pages/teacher/PaperDetailPage'));
const QuestionsPage = lazy(() => import('@/pages/teacher/QuestionsPage'));
const QuestionFormPage = lazy(() => import('@/pages/teacher/QuestionFormPage'));
const QuestionDetailPage = lazy(() => import('@/pages/teacher/QuestionDetailPage'));
const BulkImportPage = lazy(() => import('@/pages/teacher/BulkImportPage'));
const ReviewQueuePage = lazy(() => import('@/pages/teacher/ReviewQueuePage'));

const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsersPage = lazy(() => import('@/pages/admin/UsersPage'));
const AdminUserDetailPage = lazy(() => import('@/pages/admin/UserDetailPage'));
const AdminOrdersPage = lazy(() => import('@/pages/admin/OrdersPage'));
const AdminContentPage = lazy(() => import('@/pages/admin/ContentPage'));
const AdminAuditPage = lazy(() => import('@/pages/admin/AuditLogPage'));

const wrap = (node: ReactNode) => <Suspense fallback={<LoadingScreen />}>{node}</Suspense>;

const router = createBrowserRouter([
  { path: ROUTES.HOME, element: wrap(<LandingPage />) },
  {
    element: <PublicRoute />,
    children: [
      { path: ROUTES.LOGIN, element: wrap(<LoginPage />) },
      { path: ROUTES.REGISTER, element: wrap(<RegisterPage />) },
      { path: ROUTES.VERIFY_OTP, element: wrap(<VerifyOtpPage />) },
      { path: ROUTES.FORGOT_PASSWORD, element: wrap(<ForgotPasswordPage />) },
      { path: ROUTES.RESET_PASSWORD, element: wrap(<ResetPasswordPage />) }
    ]
  },
  { path: ROUTES.TERMS, element: wrap(<TermsPage />) },
  { path: ROUTES.PRIVACY, element: wrap(<PrivacyPage />) },
  { path: ROUTES.SUPPORT, element: wrap(<SupportPage />) },
  { path: ROUTES.UNAUTHORIZED, element: wrap(<UnauthorizedPage />) },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            element: <RoleGuard allow={['student']} />,
            children: [
              { path: ROUTES.STUDENT.ROOT, element: wrap(<StudentDashboard />) },
              { path: ROUTES.STUDENT.COURSES, element: wrap(<CoursesPage />) },
              { path: ROUTES.STUDENT.COURSE_DETAIL, element: wrap(<CourseDetailPage />) },
              { path: ROUTES.STUDENT.PRACTICE, element: wrap(<PracticeSetupPage />) },
              { path: ROUTES.STUDENT.ATTEMPT, element: wrap(<AttemptPage />) },
              { path: ROUTES.STUDENT.RESULTS, element: wrap(<ResultsPage />) },
              { path: ROUTES.STUDENT.RESULT, element: wrap(<AttemptResultPage />) },
              { path: ROUTES.STUDENT.ANALYTICS, element: wrap(<AnalyticsPage />) },
              { path: ROUTES.STUDENT.SUBSCRIBE, element: wrap(<SubscribePage />) }
            ]
          },
          {
            element: <RoleGuard allow={['mentor']} />,
            children: [
              { path: ROUTES.MENTOR.ROOT, element: wrap(<MentorDashboard />) },
              { path: ROUTES.MENTOR.MENTEES, element: wrap(<MenteesPage />) },
              { path: ROUTES.MENTOR.MENTEE_DETAIL, element: wrap(<MenteeDetailPage />) },
              { path: ROUTES.MENTOR.CHAT, element: wrap(<ChatPage />) },
              { path: ROUTES.MENTOR.CHAT_THREAD, element: wrap(<ChatPage />) },
              { path: ROUTES.MENTOR.REPORTS, element: wrap(<ReportsPage />) },
              { path: ROUTES.MENTOR.PROFILE, element: wrap(<MentorProfilePage />) }
            ]
          },
          {
            element: <RoleGuard allow={['teacher', 'admin']} />,
            children: [
              { path: ROUTES.TEACHER.ROOT, element: wrap(<TeacherDashboard />) },
              { path: ROUTES.TEACHER.PAPERS, element: wrap(<PapersPage />) },
              { path: ROUTES.TEACHER.PAPER_NEW, element: wrap(<PaperFormPage />) },
              { path: ROUTES.TEACHER.PAPER_DETAIL, element: wrap(<PaperDetailPage />) },
              { path: ROUTES.TEACHER.PAPER_EDIT, element: wrap(<PaperFormPage />) },
              { path: ROUTES.TEACHER.QUESTIONS, element: wrap(<QuestionsPage />) },
              { path: ROUTES.TEACHER.QUESTION_NEW, element: wrap(<QuestionFormPage />) },
              { path: ROUTES.TEACHER.QUESTION_DETAIL, element: wrap(<QuestionDetailPage />) },
              { path: ROUTES.TEACHER.QUESTION_EDIT, element: wrap(<QuestionFormPage />) },
              { path: ROUTES.TEACHER.BULK_IMPORT, element: wrap(<BulkImportPage />) },
              { path: ROUTES.TEACHER.REVIEW, element: wrap(<ReviewQueuePage />) }
            ]
          },
          {
            element: <RoleGuard allow={['admin']} />,
            children: [
              { path: ROUTES.ADMIN.ROOT, element: wrap(<AdminDashboard />) },
              { path: ROUTES.ADMIN.USERS, element: wrap(<AdminUsersPage />) },
              { path: ROUTES.ADMIN.USER_DETAIL, element: wrap(<AdminUserDetailPage />) },
              { path: ROUTES.ADMIN.ORDERS, element: wrap(<AdminOrdersPage />) },
              { path: ROUTES.ADMIN.CONTENT, element: wrap(<AdminContentPage />) },
              { path: ROUTES.ADMIN.AUDIT, element: wrap(<AdminAuditPage />) }
            ]
          },
          { path: ROUTES.PROFILE, element: wrap(<ProfilePage />) },
          { path: ROUTES.SETTINGS, element: wrap(<SettingsPage />) }
        ]
      }
    ]
  },
  { path: '*', element: wrap(<NotFoundPage />) }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
