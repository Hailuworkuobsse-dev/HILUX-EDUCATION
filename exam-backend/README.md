# ExamPrep — Backend

Express + Prisma (MySQL) API for the ExamPrep platform. Each build step appends
its own section to this file.

```bash
cp .env.example .env       # then fill in DATABASE_URL + JWT secrets
npm install
npm run prisma:generate
npm run db:up              # docker-compose MySQL
npm run prisma:migrate
npm run prisma:seed
npm run dev                # http://localhost:4000/api
```

---

## Step 5 — Teacher module

No schema change. This step adds the authoring pipeline and doubles the
request body limit from 1 MB → 5 MB (for CSV bulk import).

### Endpoints

All routes are gated by `authenticate` + `requireRole('teacher', 'admin')`
and prefixed with `/api/teacher`.

| Method | Path | Notes |
|---|---|---|
| GET    | `/overview` | Teacher stats (draft/review/published counts, pending reviews, flagged) |
| GET    | `/papers?subjectId=&status=&search=` | List all papers visible to teachers |
| POST   | `/papers` | Create paper (draft) — validates all `questionIds` are published |
| GET    | `/papers/:paperId` | Paper detail with full questions + subject topics |
| PATCH  | `/papers/:paperId` | Update (partial). Editing a `review`/`published` paper → `draft` |
| DELETE | `/papers/:paperId` | Only drafts, only own |
| POST   | `/papers/:paperId/submit-review` | `draft` → `review`, own only |
| POST   | `/papers/:paperId/approve` | `review` → `published`, **not own** |
| POST   | `/papers/:paperId/reject` | `review` → `draft` with reason, **not own** |
| POST   | `/papers/:paperId/publish` | Alias for approve |
| POST   | `/papers/:paperId/archive` | `published` → `archived`, own only |
| GET    | `/questions?…` | Paginated list, filters: subject, topic, difficulty, status, search |
| POST   | `/questions` | Create (draft) — server regenerates option IDs |
| GET    | `/questions/:questionId` | Full question + options + correct answer |
| PATCH  | `/questions/:questionId` | Update (forces `draft`, bumps `version`) |
| DELETE | `/questions/:questionId` | Only drafts, only own, only if no student attempts |
| POST   | `/questions/:questionId/submit-review` | `draft` → `review`, own only |
| POST   | `/questions/:questionId/review` | `{ decision: 'approve' \| 'reject', reason? }`, **not own** |
| POST   | `/questions/:questionId/publish` | Alias for approve |
| POST   | `/questions/:questionId/archive` | `published` → `archived`, own only |
| GET    | `/review-queue/questions` | Questions in `review` **not created by caller** |
| GET    | `/review-queue/papers` | Papers in `review` **not created by caller** |
| POST   | `/questions/import/validate` | `{ csv }` → validation preview |
| POST   | `/questions/import` | `{ csv }` → commit; only valid rows inserted as drafts |

Route order matters: the two `/questions/import*` routes are registered
**before** `/questions/:questionId`, otherwise `import` would be captured as a
question id.

### Workflow rules (both papers and questions)

- **Only the creator can edit / delete / submit for review / archive.**
- **Only a different teacher can approve or reject.**
  Enforced at the service layer — the UI also hides the buttons, but the
  server is the source of truth.
- **Editing a `review` or `published` item resets it to `draft`** and clears
  `reviewedById`, `rejectionReason`, `publishedAt`. For questions, `version` is
  also bumped.
- **Rejecting** requires a reason ≥ 10 chars; stored on `rejectionReason`.
- **Deletion** is only allowed from `draft`. A question that has been
  attempted by any student cannot be deleted (returns a clear `400`).
- **Paper submission for review** validates that *all* questions on the paper
  are `published`.

State machine:

```
draft ──submit-review──▶ review ──approve/publish──▶ published ──archive──▶ archived
  ▲                        │
  └────────reject──────────┘   (reject requires a reason ≥ 10 chars)
```

### Option IDs — server-side regeneration

The frontend always sends positional IDs (`opt-1`, `opt-2`, …) that would
collide across questions. The server:

1. Finds `correctOptionId` in the incoming `options` array (by ID match).
2. Generates fresh `randomUUID()` IDs for every option.
3. Sets the question's `correctOptionId` to the new ID at the correct index.

This makes option IDs collision-proof with zero client changes.

### CSV bulk import

Two-phase, both endpoints take `{ "csv": "<raw csv text>" }`:

1. `POST /api/teacher/questions/import/validate` →
   `{ rows: [{ rowNumber, status, subjectName, prompt, errors[] }], summary: { total, valid, invalid } }`
   Nothing is written. `rowNumber` is 1-based against the file, so the first
   data row is `2` (the header is row 1).
2. `POST /api/teacher/questions/import` → `{ imported, skipped, total }`.
   Only rows with zero errors are inserted, always as `draft`, `version: 1`,
   owned by the importing teacher. Invalid rows are counted in `skipped`.

**Format** (13 columns, exact header order):

| # | Column | Required | Rules |
|---|---|---|---|
| 1 | `subject` | ✔ | Matches `Subject.name` **or** `Subject.slug`, case-insensitive |
| 2 | `topic` | ✔ | Must exist under the resolved subject (case-insensitive name match) |
| 3 | `difficulty` | ✔ | `easy` \| `medium` \| `hard` (case-insensitive) |
| 4 | `year` | – | Integer, 2000–2100 |
| 5 | `language` | ✔ | `en` \| `am` \| `om` \| `ti` (case-insensitive) |
| 6 | `prompt` | ✔ | ≥ 10 characters |
| 7 | `optionA` | ✔ | |
| 8 | `optionB` | ✔ | |
| 9 | `optionC` | ✔ | |
| 10 | `optionD` | – | Optional, but `optionE` cannot be filled if `optionD` is empty |
| 11 | `optionE` | – | Optional |
| 12 | `correct` | ✔ | `A`–`E` (case-insensitive) and must point at a filled option |
| 13 | `explanation` | – | Free text |

Parser/limits:

- RFC-4180 CSV: quoted fields, `""` escapes, embedded commas **and** newlines
  inside quotes, both LF and CRLF, UTF-8 BOM tolerated.
- The header row is mandatory and compared case-insensitively; a mismatch is a
  `400` listing the expected headers.
- Max **5,000** data rows per import (`400` above that). The 5 MB body limit
  set in `src/app.ts` is what makes a file that size uploadable.
- Every error is collected per row (validation does not stop at the first one),
  so the preview shows all problems at once.

**Sample** (this is also what the "Download sample" button in the UI produces):

```csv
subject,topic,difficulty,year,language,prompt,optionA,optionB,optionC,optionD,optionE,correct,explanation
Mathematics,Algebra,easy,2023,en,"If x + 2 = 5, what is x?",1,2,3,4,,C,"Subtract 2 from both sides: x = 3."
English,Grammar,medium,2022,en,"Choose the correct sentence.","He go to school.","He goes to school.","He going to school.","He gone to school.",,B,"Third-person singular takes 'goes'."
```

### Testing the review workflow locally

The review rules forbid approving your own submission, so you need a second
teacher:

```bash
npm run prisma:seed           # base seed: subjects, topics, teacher@examprep.local
npm run prisma:seed:teacher   # adds teacher2 + demo questions/papers in every state
```

| Account | Password | Seeded content |
|---|---|---|
| `teacher@examprep.local` | `Teacher1234` | 2 draft questions, 1 in review, 3 published, 1 draft paper, 1 published paper |
| `teacher2@examprep.local` | `Teacher1234` | 2 questions in review + 1 paper in review (visible in teacher 1's review queue) |

The seed is idempotent — re-running it skips questions/papers that already
exist (matched on prompt/title + author).

### Files added / changed

```
src/modules/teacher/
├── types.ts                  DTOs + re-exported form-input types
├── schemas.ts                Zod schemas (forms, queries, review, import)
├── mappers.ts                Prisma row → DTO
├── csv.ts                    RFC-4180 parser (+ csvEscape for samples)
├── overview.service.ts       dashboard counts
├── overview.controller.ts
├── papers.service.ts         CRUD + submit/approve/reject/publish/archive
├── papers.controller.ts
├── questions.service.ts      CRUD + workflow + option-ID regeneration
├── questions.controller.ts
├── review.service.ts         review queue (excludes own submissions)
├── review.controller.ts
├── bulk-import.service.ts    validate / commit
├── bulk-import.controller.ts
└── teacher.routes.ts         replaces the step-4 placeholder
prisma/seed-teacher.ts        second teacher + demo content
```

Touched outside the module (required for this step to compile):

- `src/app.ts` — JSON/urlencoded body limit `1mb` → `5mb`.
- `src/lib/audit.ts` — added the new `AuditAction` members used by the teacher
  services: `question.created|updated|deleted|rejected`,
  `paper.created|updated|deleted|rejected`.
- `src/lib/validate.ts` — `validate()` now returns the schema's **output** type
  (`z.infer<S>`) instead of the input type, so fields with `.default()`
  (e.g. `language`) are non-optional at the call site.
- `package.json` — added `"prisma:seed:teacher": "tsx prisma/seed-teacher.ts"`.

Audit events are written best-effort (`writeAudit(...).catch(() => undefined)`):
a logging failure never fails the request.

---

## Step 6 — Admin, Payments, Account

No schema change. This is the final step. It:

- Expands the `AuditAction` union (teacher actions from Step 5 + admin/account actions)
- Adds `signExportToken` / `verifyExportToken` helpers in `src/lib/jwt.ts`
- Adds `src/modules/payments/` — init / status / webhook / dev-simulate
- Adds `src/modules/account/` — preferences, password, export, delete
- Replaces the `admin.routes.ts` placeholder with real admin endpoints
- Adds an **hourly trial-expiry job** in `src/index.ts`

### Admin endpoints (all `requireRole('admin')`)

| Method | Path | Notes |
|---|---|---|
| GET    | `/api/admin/overview` | Platform stats |
| GET    | `/api/admin/users?role=&status=&search=&page=&pageSize=` | Paginated user list |
| GET    | `/api/admin/users/:userId` | Detail + recent orders + recent audit |
| PATCH  | `/api/admin/users/:userId/role` | `{ role, reason? }` — creates `MentorProfile` if new role is mentor |
| PATCH  | `/api/admin/users/:userId/status` | `{ status, reason }` — suspending revokes all sessions |
| POST   | `/api/admin/users/:userId/reset-password` | Issues a 1-hour reset token, revokes sessions |
| GET    | `/api/admin/orders?status=&provider=&search=&page=&pageSize=` | Paginated order list |
| GET    | `/api/admin/orders/:orderId` | Order detail |
| POST   | `/api/admin/orders/:orderId/refund` | `{ amount?, reason }` — full refund also cancels enrollment |
| POST   | `/api/admin/orders/:orderId/reconcile` | Records a reconciliation event |
| GET    | `/api/admin/content/flags?status=` | Content flags |
| POST   | `/api/admin/content/flags/:flagId/resolve` | `{ resolution: 'unpublish' \| 'delete' \| 'keep', reason }` |
| GET    | `/api/admin/audit?actorId=&action=&resourceType=&search=&page=&pageSize=` | Paginated audit log |

Admin guard rails: an admin **cannot change their own role or status**
(`400`), a no-op role change is rejected, and `totalSpent` on the user DTO
counts `succeeded` orders only.

### Payments endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST   | `/api/payments/init` | ✅ | `{ subjectId, provider }` → `201 { orderId, checkoutUrl?, instructions? }` |
| GET    | `/api/payments/:orderId/status` | ✅ | `{ status, paidAt?, failureReason? }` |
| POST   | `/api/payments/webhook/:provider` | — | Provider callback (verify signature when wiring real providers) |
| GET/POST | `/api/payments/dev/:orderId/simulate-payment` | dev only | Marks the order succeeded + activates the enrollment. **Not mounted when `NODE_ENV=production`** |

**Flow:** in dev, `init` returns a `checkoutUrl` pointing at the simulate
endpoint. The modal polls `/status` every 3 s; opening the checkout URL flips
the order to `succeeded`, activates the enrollment, and the modal closes.

The dev route is mounted with `optionalAuth` because `window.open()` cannot
send an `Authorization` header. When a token *is* present the stricter
owner check applies; when it is absent the order id (an unguessable cuid) is
the only handle. The service re-asserts `NODE_ENV !== 'production'` as a
second guard, so the endpoint is unreachable in production twice over.

**Idempotency:** `init` uses `idempotencyKey = sha256(userId:subjectId:provider:window)`
with a 15-minute window. Repeating inside the window returns the existing
`pending` order. If that window's key is held by a **terminal** order (e.g. a
failed attempt), a fresh key is derived so the retry can create a new order
instead of violating the unique constraint.

**State transitions** live in `markSucceeded` / `markFailed`:
- `markSucceeded` is idempotent (no-op if already `succeeded`) and upserts the
  enrollment to `active` with `currentPeriodEndsAt = null`.
- `markFailed` never downgrades an order that already reached `succeeded` or
  `refunded` — provider callbacks can arrive late or out of order.
- Every transition writes an audit entry (`payment.initiated`,
  `payment.succeeded`, `payment.failed`).

**Providers** (in `src/modules/payments/providers.ts`):
- **Telebirr**, **CBE Birr**, **Chapa** — each has an `init()` and a
  `parseWebhook()`. Both are **dev stubs** returning simulated checkout URLs;
  `init()` **throws in production** with a clear "not configured" message.
- Webhook verification is currently a passthrough — add signature verification
  per provider before going live. Chapa's `{ tx_ref, status: 'success' }` shape
  is already mapped; Telebirr/CBE expect `{ providerRef, status }`.
- An order is matched by `providerRef` **or** by `id`, so the dev simulator's
  `dev-<orderId>` refs resolve too.

### Account endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET    | `/api/me/preferences` | ✅ | Notification prefs + language + timezone |
| PATCH  | `/api/me/preferences` | ✅ | Partial update (only supplied fields are written) |
| POST   | `/api/me/password` | ✅ | `{ currentPassword, newPassword }` — revokes all other sessions |
| POST   | `/api/me/export` | ✅ | Returns `{ url, expiresAt }` — 5-minute signed download URL |
| GET    | `/api/me/export/download?token=` | — | Serves a JSON file (`Content-Disposition: attachment`) |
| POST   | `/api/me/delete-account` | ✅ | `{ confirm: 'DELETE', reason? }` — anonymizes PII, deletes progress, keeps orders + audit |

**Export:** the download URL is signed with `JWT_ACCESS_SECRET` using a
distinct `type: 'export'` claim, so a normal access token is rejected by the
download endpoint. It expires in 5 minutes, which makes `window.open` work
without auth headers while keeping the link short-lived. The bundle redacts
`passwordHash` and lists each dataset (profile / enrollments / attempts /
orders) exactly once.

Set `API_PUBLIC_URL` in production so the link points at your public host
instead of `http://localhost:$PORT` (documented in `.env.example`).

**Delete account:** anonymizes the user (email → `deleted-<id>@deleted.local`,
phone → placeholder, fullName → "Deleted User", status → `suspended`,
password → unusable), deletes all attempts / enrollments / review schedules /
notification prefs / sent messages, and revokes every refresh token.
**Orders and audit logs are retained** (legal compliance). Cascade FKs stay
intact because the `User` row still exists.

### Scheduled jobs

An hourly job in `src/index.ts` flips overdue `trialing` enrollments to
`expired`:

```ts
setInterval(() => void expireTrials(), 60 * 60 * 1000).unref();
void expireTrials(); // …and once on startup
```

`unref()` keeps the timer from holding the process open during graceful
shutdown, and the job swallows (and logs) its own errors so a DB blip never
crashes the API.

### Testing the admin dashboard locally

```bash
npm run prisma:seed         # base: subjects, topics, admin/teacher/mentor/student
npm run prisma:seed:teacher # step 5: 2nd teacher + questions/papers
npm run prisma:seed:admin   # step 6: 3 demo orders + 2 content flags
```

`prisma:seed:admin` is idempotent — it skips orders if any exist and skips
flags if any exist. Admin login: `admin@examprep.local / Admin1234`.

### Files added / changed

```
src/modules/payments/   types · schemas · providers · service · controller · routes
src/modules/admin/      types · schemas · overview · users · orders(+mappers)
                        · content · audit(+mappers) · admin.routes (placeholder → real)
src/modules/account/    types · schemas · service · controller · routes
prisma/seed-admin.ts    demo orders + content flags
```

Touched outside the new modules:

- `src/routes/index.ts` — mounts `/api/payments` and `/api/me`.
- `src/index.ts` — trial-expiry job (also fixes the mojibake in the startup banner).
- `src/lib/audit.ts` — expanded `AuditAction` union.
- `src/lib/jwt.ts` — export-token helpers.
- `src/config/env.ts` + `.env.example` — optional `API_PUBLIC_URL`.
- `package.json` — `"prisma:seed:admin": "tsx prisma/seed-admin.ts"`.

### Route mounting order (important)

`contentRouter` is mounted at the catch-all `'/'` and begins with
`use(authenticate)`. If it is registered before the other routers, *every*
request enters it first and is rejected with `401` before it can reach them —
which silently breaks all three public step-6 endpoints:

- `POST /api/payments/webhook/:provider` (provider callbacks carry no JWT)
- `GET /api/me/export/download?token=` (opened with `window.open`)
- `GET|POST /api/payments/dev/:orderId/simulate-payment` (opened in a browser)

`src/routes/index.ts` therefore mounts it **last**: `/health`, `/auth`, the
role-scoped routers, `/payments`, `/me`, then `'/'`. None of contentRouter's
own paths (`/subjects`, `/topics`, `/courses`, `/papers`, `/attempts`,
`/analytics/*`, `/enrollments`) collide with those prefixes. If you add a
public endpoint later, mount it above contentRouter too.

> Side effect: an unauthenticated request to a path that matches nothing
> returns `401` rather than `404`, because contentRouter's auth gate runs
> before the not-found fallback. Authenticated callers get the proper `404`.
