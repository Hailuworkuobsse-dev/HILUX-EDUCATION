export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_OTP: '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  UNAUTHORIZED: '/unauthorized',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  STUDENT: {
    ROOT: '/student',
    COURSES: '/student/courses',
    COURSE_DETAIL: '/student/courses/:subjectId',
    PRACTICE: '/student/practice',
    ATTEMPT: '/student/practice/:attemptId',
    RESULTS: '/student/results',
    RESULT: '/student/results/:attemptId',
    ANALYTICS: '/student/analytics',
    SUBSCRIBE: '/student/subscribe'
  },
  MENTOR: {
    ROOT: '/mentor',
    MENTEES: '/mentor/mentees',
    MENTEE_DETAIL: '/mentor/mentees/:menteeId',
    CHAT: '/mentor/chat',
    CHAT_THREAD: '/mentor/chat/:threadId',
    REPORTS: '/mentor/reports',
    PROFILE: '/mentor/profile'
  },
  TEACHER: {
    ROOT: '/teacher',
    PAPERS: '/teacher/papers',
    PAPER_NEW: '/teacher/papers/new',
    PAPER_DETAIL: '/teacher/papers/:paperId',
    PAPER_EDIT: '/teacher/papers/:paperId/edit',
    QUESTIONS: '/teacher/questions',
    QUESTION_NEW: '/teacher/questions/new',
    QUESTION_DETAIL: '/teacher/questions/:questionId',
    QUESTION_EDIT: '/teacher/questions/:questionId/edit',
    BULK_IMPORT: '/teacher/bulk-import',
    REVIEW: '/teacher/review'
  },
  ADMIN: {
    ROOT: '/admin',
    USERS: '/admin/users',
    USER_DETAIL: '/admin/users/:userId',
    ORDERS: '/admin/orders',
    CONTENT: '/admin/content',
    AUDIT: '/admin/audit'
  }
} as const;
