# Deployment

## Prerequisites

- Node.js 20+ (`.nvmrc` pins 20)
- MySQL 8 (managed or self-hosted)
- A domain + TLS termination (nginx, Caddy, or a cloud LB)
- Real JWT secrets: `npx tsx scripts/generate-secrets.ts`

## Environment variables

Copy `.env.example` to `.env` and fill it in. `src/config/env.ts` validates every
variable at boot and exits with a printed field-error list if something is wrong —
so a typo fails fast instead of misbehaving at runtime.

| Variable | Required | Notes |
|---|---|---|
| `NODE_ENV` | ✅ | `development` / `test` / `production`. Production disables the dev payment simulator and enables `trust proxy`. |
| `PORT` | – | Default `4000`. |
| `DATABASE_URL` | ✅ | `mysql://user:pass@host:3306/db` |
| `JWT_ACCESS_SECRET` | ✅ | Min 16 chars; use 32 random bytes. |
| `JWT_REFRESH_SECRET` | ✅ | Must differ from the access secret. |
| `JWT_ACCESS_EXPIRES_IN` | – | Default `15m`. |
| `JWT_REFRESH_EXPIRES_IN` | – | Default `30d`. |
| `CORS_ORIGIN` | ✅ | Comma-separated list of allowed browser origins. |
| `API_PUBLIC_URL` | – | Public base URL used to build links the browser opens directly (data export, dev checkout). Must be a valid URL when set. |
| `TRIAL_DAYS` | – | Default `90`. |
| `PRICE_PER_COURSE` | – | Default `150` (integer, minor units of `CURRENCY`). |
| `CURRENCY` | – | Default `ETB`. |
| `TELEBIRR_*`, `CBE_*`, `CHAPA_SECRET_KEY` | – | Payment provider credentials. The adapters are **stubs** — see the go-live checklist. |
| `SMS_API_URL`, `SMS_API_KEY`, `SMS_FROM_ID` | – | Afromessage. Empty ⇒ messages are logged, not sent. |
| `EMAIL_API_URL`, `EMAIL_API_KEY`, `EMAIL_FROM` | – | Resend. Empty ⇒ emails are logged, not sent. |

## Build

```bash
npm ci
npx prisma generate
npm run build      # tsc → dist/
```

## Database schema

The repository currently has **no committed `prisma/migrations/`**, so the first
deploy pushes the schema directly:

```bash
npx prisma db push          # creates/updates tables from prisma/schema.prisma
npm run prisma:seed         # subjects, topics, demo users
```

Then baseline it so future deploys are migration-driven:

```bash
npx prisma migrate dev --name init   # generates prisma/migrations/ — commit it
# from then on, deploys use:
npx prisma migrate deploy
```

Seeds are idempotent and safe to re-run:

```bash
npm run prisma:seed          # base: subjects, topics, admin/teacher/mentor/student
npm run prisma:seed:mentor   # mentor demo data
npm run prisma:seed:teacher  # 2nd teacher + questions/papers in every workflow state
npm run prisma:seed:admin    # demo orders + content flags
# or all of them:
make seed-all
```

> Skip the demo seeds in production, or delete the demo accounts afterwards —
> they use well-known passwords.

## Run

```bash
NODE_ENV=production npm run start     # node dist/index.js
```

### systemd

```ini
# /etc/systemd/system/examprep-api.service
[Unit]
Description=ExamPrep API
After=network.target mysql.service

[Service]
Type=simple
User=examprep
WorkingDirectory=/var/www/exam-backend
EnvironmentFile=/etc/examprep/api.env
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload && sudo systemctl enable --now examprep-api
```

### Docker

```bash
docker build -t examprep-api .
docker run --rm -p 4000:4000 --env-file .env examprep-api
```

Or the full stack (MySQL + API) with `docker-compose.prod.yml`:

```bash
export JWT_ACCESS_SECRET=... JWT_REFRESH_SECRET=... MYSQL_PASSWORD=...
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```

The image is multi-stage (builder → runtime), runs as a non-root user, installs
production dependencies only, and carries a `HEALTHCHECK` against
`/api/health/live`. The compose file waits for MySQL to be healthy before
starting the API.

The build runs `npx prisma generate` **before** `tsc` — the compiler needs the
generated `@prisma/client` types.

## Reverse proxy (nginx)

```nginx
server {
  listen 443 ssl http2;
  server_name api.examprep.example;

  # ssl_certificate     /etc/letsencrypt/live/api.examprep.example/fullchain.pem;
  # ssl_certificate_key /etc/letsencrypt/live/api.examprep.example/privkey.pem;

  # Must be >= the API's 5 MB body limit, or CSV bulk import fails with 413.
  client_max_body_size 6m;

  location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_http_version 1.1;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    # Pass the correlation id through so client and server logs line up
    proxy_set_header X-Request-Id      $request_id;
    proxy_read_timeout 60s;
  }

  location = /api/health/live { access_log off; proxy_pass http://127.0.0.1:4000; }
}
```

Set `CORS_ORIGIN` to the **frontend** origin (e.g. `https://examprep.example`)
and `API_PUBLIC_URL` to the public API base (`https://api.examprep.example`).
`NODE_ENV=production` makes Express trust the proxy headers, which is what keeps
rate limiting keyed on the real client IP.

## Health checks

| Endpoint | Purpose | Failure mode |
|---|---|---|
| `GET /api/health/live` | Liveness — process is up | Never checks dependencies; a 5xx means the process is wedged → restart |
| `GET /api/health/ready` | Readiness — DB reachable | `503 { ok:false, db:'down' }` → take out of rotation, do **not** restart |
| `GET /api/health` | Info — service, env, uptime | |
| `GET /api/health/db` | Legacy DB check | |

End-to-end check after a deploy (needs `curl`, `jq`, and seeded demo users):

```bash
bash scripts/smoke.sh https://api.examprep.example
```

## Scheduled jobs

`src/index.ts` runs an **in-process** hourly job that flips overdue `trialing`
enrollments to `expired` (and once on startup). It is `unref()`'d and swallows its
own errors, so a DB blip never crashes the API.

⚠️ Because it is in-process, **every replica runs it**. It is idempotent
(`updateMany` on `status: 'trialing'`), so extra runs are harmless — but if you
scale out and add more jobs, move them to a single worker or a real cron/scheduler.

## Backups

```bash
mysqldump --single-transaction --routines --triggers \
  -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" | gzip > "backup-$(date +%F).sql.gz"
```

Test restores. Audit logs and orders are deliberately retained when a user
deletes their account, so they are part of what you are backing up.

## Go-live checklist

- [ ] **Payment webhooks are unverified.** `parseWebhook` currently trusts the
      request body. Implement signature/HMAC verification per provider in
      `src/modules/payments/providers.ts` before accepting real money.
- [ ] **Provider `init()` are stubs** — they throw in production by design.
      Wire the real Telebirr / CBE Birr / Chapa calls and return the real
      `checkoutUrl` + `providerRef`.
- [ ] **Refunds are local-only.** `POST /admin/orders/:id/refund` marks the order
      refunded and cancels access; it does not call the provider. Add the
      provider refund call at the `TODO` in `orders.service.ts`.
- [ ] Generate real `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`
      (`npx tsx scripts/generate-secrets.ts`) — never ship the dev defaults.
- [ ] `CORS_ORIGIN` lists only your real frontend origins.
- [ ] `API_PUBLIC_URL` points at the public API host.
- [ ] Set `SMS_API_KEY` / `EMAIL_API_KEY`, otherwise OTPs are only logged.
- [ ] Remove or rotate the seeded demo accounts.
- [ ] TLS terminated and `NODE_ENV=production` set (enables `trust proxy`).
- [ ] Review the rate limits in `src/app.ts` and `src/middleware/auth-rate-limit.ts`.
- [ ] Log redaction is on (`src/lib/logger.ts`) — confirm no secrets leak into
      your log sink.
- [ ] DB backups scheduled **and** a restore has been rehearsed.
- [ ] CI green: `.github/workflows/ci.yml` (repo root) runs tests against MySQL 8.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Boot exits with "❌ Invalid environment variables" | A required var is missing or malformed — the printed field errors say which. Note `API_PUBLIC_URL`/`SMS_API_URL`/`EMAIL_API_URL` must be valid URLs (empty is allowed). |
| `❌ Database connection failed` on startup | MySQL not reachable; check `DATABASE_URL`, the DB user's host grants, and that the container is healthy. |
| `413` on CSV bulk import | Proxy body limit below 5 MB — set `client_max_body_size` (nginx). |
| `/api/payments/webhook/...` returns `401` | The catch-all `contentRouter` is mounted before `/payments` in `src/routes/index.ts`. It must stay **last** — see the README's "Route mounting order". |
| Provider webhook arrives but nothing changes | The order is matched by `providerRef` **or** `id`; confirm the ref your `init()` stored matches what the provider sends. |
| Dev simulate URL 404s | `NODE_ENV=production` (route intentionally not mounted), or you are on an older build without the GET handler. |
| Tests fail with `ECONNREFUSED 3306` | Start MySQL (`npm run db:up`) or set `DATABASE_URL`; the unit tests that hit HTTP do not need a DB, but `/api/health/ready` does. |
