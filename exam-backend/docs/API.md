# ExamPrep API reference

Base URL: `http://localhost:4000/api`

Full endpoint list per domain:

## Auth
`POST /auth/register` · `POST /auth/login` · `POST /auth/verify-otp` · `POST /auth/resend-otp`
`POST /auth/forgot-password` · `POST /auth/reset-password` · `POST /auth/refresh`
`GET /auth/me` · `POST /auth/logout` · `POST /auth/resend-verification`

Register/login/OTP/reset routes are behind a stricter limiter (10 requests / 15 min per IP);
`/auth/refresh` and `/auth/me` behind a looser one (60 / 15 min).

## Content (shared, auth-gated)
`GET /subjects` · `GET /topics?subjectId=` · `GET /courses` · `GET /courses/:subjectId`
`POST /enrollments` · `GET /papers` · `POST /flags`
`POST /attempts` · `GET /attempts` · `GET /attempts/:id` · `PATCH /attempts/:id/answers/:qid`
`POST /attempts/:id/submit` · `GET /attempts/:id/result`
`GET /analytics/me/{overview,topics,progress,due-reviews}`

`POST /flags` body: `{ questionId, reason (3–120), description (10–2000) }` → `201`.
Returns `409` if the caller already has an open flag on that question, `400` if the
question is archived.

## Mentor
`GET /mentor/overview` · `GET /mentor/mentees` · `GET /mentor/mentees/:id`
`GET /mentor/threads` · `GET /mentor/threads/:id` · `GET /mentor/threads/:id/messages?since=`
`POST /mentor/threads/:id/messages` · `PATCH /mentor/threads/:id/read`
`GET /mentor/threads/unread-count` · `GET /mentor/reports` · `PATCH /mentor/reports/:id`
`GET /mentor/profile` · `PATCH /mentor/profile`

All require `requireRole('mentor')`.

## Teacher
`GET /teacher/overview`
`GET|POST /teacher/papers` · `GET|PATCH|DELETE /teacher/papers/:id`
`POST /teacher/papers/:id/{submit-review,approve,reject,publish,archive}`
`GET|POST /teacher/questions` · `GET|PATCH|DELETE /teacher/questions/:id`
`POST /teacher/questions/:id/{submit-review,review,publish,archive}`
`GET /teacher/review-queue/{questions,papers}`
`POST /teacher/questions/import/validate` · `POST /teacher/questions/import`

All require `requireRole('teacher', 'admin')`. Approve/reject cannot be performed on
your own submission.

## Admin
`GET /admin/overview`
`GET /admin/users` · `GET /admin/users/:id`
`PATCH /admin/users/:id/role` · `PATCH /admin/users/:id/status` · `POST /admin/users/:id/reset-password`
`GET /admin/orders` · `GET /admin/orders/:id` · `POST /admin/orders/:id/refund` · `POST /admin/orders/:id/reconcile`
`GET /admin/content/flags` · `POST /admin/content/flags/:id/resolve`
`GET /admin/audit`

All require `requireRole('admin')`.

## Payments
`POST /payments/init` · `GET /payments/:orderId/status`
`POST /payments/webhook/:provider`
`POST|GET /payments/dev/:orderId/simulate-payment` (dev only — not mounted in production)

`GET` on the dev route renders an HTML confirmation page (that is what the checkout
button opens); `POST` returns JSON.

## Account
`GET|PATCH /me/preferences` · `POST /me/password` · `POST /me/export`
`GET /me/export/download?token=` · `POST /me/delete-account`

`/me/export/download` is public — it is authorized by a 5-minute signed token
(`type: 'export'`) so `window.open` works without headers.

## Health
`GET /api/health/live` · `GET /api/health/ready` · `GET /api/health` · `GET /api/health/db`

`live` never touches dependencies (liveness probe). `ready` checks the DB and returns
`503 { ok: false, db: 'down' }` when it is unreachable (readiness probe).

## Conventions

- **Auth header** — `Authorization: Bearer <accessToken>`
- **Errors** — `{ message, code, details? }`; codes include `BAD_REQUEST`, `UNAUTHORIZED`,
  `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `TOO_MANY_REQUESTS`, `NOT_IMPLEMENTED`, `INTERNAL`
- **Pagination** — `?page=1&pageSize=25` → `{ items, total, page, pageSize, totalPages }`
- **Request ID** — every response carries `X-Request-Id` (an incoming header is honored,
  otherwise a UUID is generated). It is also attached to every request log line.
- **Malformed JSON** — returns `{ message: 'Invalid JSON body', code: 'BAD_REQUEST' }`
  with status 400, never an HTML error page.
- **Body limit** — 5 MB (JSON and urlencoded), sized for CSV bulk import.
- **Rate limits** — 300 requests/min per IP across `/api`, plus the stricter auth limiters.
