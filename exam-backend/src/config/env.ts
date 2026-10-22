import { z } from 'zod';
import 'dotenv/config';

/**
 * URLs are optional, and `.env` files commonly carry empty placeholders
 * (`SMS_API_URL=`). Treat an empty string as "unset" instead of failing
 * `.url()` validation at boot.
 */
const optionalUrl = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z.string().url().optional()
);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  /** Public base URL used to build links handed to the browser (e.g. data export). */
  API_PUBLIC_URL: optionalUrl,
  TRIAL_DAYS: z.coerce.number().int().positive().default(90),
  PRICE_PER_COURSE: z.coerce.number().int().positive().default(150),
  CURRENCY: z.string().default('ETB'),

  // ─── Payment providers — optional; required only in production ──────────
  TELEBIRR_APP_ID: z.string().optional(),
  TELEBIRR_APP_KEY: z.string().optional(),
  TELEBIRR_PUBLIC_KEY: z.string().optional(),
  CBE_MERCHANT_ID: z.string().optional(),
  CBE_API_KEY: z.string().optional(),
  CBE_API_SECRET: z.string().optional(),
  CHAPA_SECRET_KEY: z.string().optional(),

  // ─── Notifications — optional; required only in production ──────────────
  SMS_API_URL: optionalUrl,
  SMS_API_KEY: z.string().optional(),
  SMS_FROM_ID: z.string().optional(),
  EMAIL_API_URL: optionalUrl,
  EMAIL_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables:');
  // eslint-disable-next-line no-console
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
