const env = import.meta.env;

function intFrom(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? '', 10);
  return Number.isFinite(n) ? n : fallback;
}

/** App-wide branding + business constants (overridable at build time). */
export const APP = {
  NAME: env.VITE_APP_NAME ?? 'ExamPrep',
  URL: env.VITE_APP_URL ?? 'http://localhost:5173',
  TRIAL_DAYS: intFrom(env.VITE_TRIAL_DAYS, 90),
  PRICE_PER_COURSE: intFrom(env.VITE_PRICE_PER_COURSE, 150),
  CURRENCY: env.VITE_CURRENCY ?? 'ETB'
} as const;

/** localStorage keys — centralised so they can never drift apart. */
export const STORAGE_KEYS = {
  accessToken: 'examprep.accessToken',
  refreshToken: 'examprep.refreshToken',
  theme: 'examprep.theme'
} as const;

export const SUBJECTS = [
  'Mathematics',
  'English',
  'Physics',
  'Chemistry',
  'Biology',
  'Geography',
  'History',
  'Civics',
  'Amharic',
  'Afaan Oromo',
  'Tigrinya',
  'Information Technology'
] as const;

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const QUESTION_STATUSES = ['draft', 'review', 'published', 'archived'] as const;
export type QuestionStatus = (typeof QUESTION_STATUSES)[number];

export const PAPER_STATUSES = QUESTION_STATUSES;
export type PaperStatus = QuestionStatus;

/** Languages the question bank supports. */
export const LANGUAGES = ['en', 'am', 'om', 'ti'] as const;
export type Language = (typeof LANGUAGES)[number];

export const PAYMENT_PROVIDERS = ['telebirr', 'cbe_birr', 'chapa', 'manual'] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

/** Providers a student can actually pay with (`manual` is admin-only). */
export const FLOW_PROVIDERS = ['telebirr', 'cbe_birr', 'chapa'] as const;
export type FlowProvider = (typeof FLOW_PROVIDERS)[number];

export const PROVIDER_LABELS: Record<PaymentProvider, string> = {
  telebirr: 'Telebirr',
  cbe_birr: 'CBE Birr',
  chapa: 'Chapa',
  manual: 'Manual'
};

/** How long the payment modal waits between status polls. */
export const PAYMENT_POLL_MS = 3000;
