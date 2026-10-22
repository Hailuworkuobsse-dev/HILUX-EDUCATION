# Frontend — notes

React 18 + Vite 5 + TypeScript (strict) + Tailwind. Mobile-first, PWA-capable.

```bash
npm install
npm run dev          # http://localhost:5173 (expects the API on :4000)
npm run typecheck    # tsc --noEmit
npm run lint         # eslint, --max-warnings 0
npm run test         # vitest (happy-dom + Testing Library)
npm run build        # tsc -b && vite build → dist/ (+ service worker)
```

## Project layout

```
src/
├── main.tsx               entry — mounts <App/>, imports index.css
├── App.tsx                providers: ErrorBoundary > Theme > Toast > Auth + SessionBootstrap
├── index.css              Tailwind layers + design tokens (CSS variables)
├── lib/                   api client, constants, roles, currency, validators, date, utils, errors
├── context/               AuthContext · ThemeContext · ToastContext
├── hooks/                 generic hooks (useQuery, useMutation, useDebounce, …)
├── components/
│   ├── ui/                design-system primitives (barrel: @/components/ui)
│   ├── layout/            AppShell, Sidebar, Topbar, Container, PageHeader, Grid, Section, Stack
│   └── feedback/          ErrorBoundary, LoadingScreen, NotFound
├── features/<domain>/     api.ts + schemas.ts + hooks/ + components/ per domain
├── pages/<role>/          route-level screens
├── router/                routes.ts (path constants), index.tsx (tree), guards
└── types/                 DTO types mirroring the backend, one file per domain
```

Convention: `features/*` own data access and domain components; `pages/*` only
compose them. `components/ui/*` must stay domain-agnostic.

## Environment variables

Vite reads env files by mode:

- `npm run dev` → `.env.development` (falls back to `.env`)
- `npm run build` → `.env.production` (falls back to `.env`)

Copy `.env.production.example` → `.env.production` before building for
production. Set `VITE_API_BASE_URL` to your real API origin (or `/api` if
you're proxying through the same host via nginx).

| Variable | Default | Used by |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | `lib/api.ts` — every request is prefixed with it |
| `VITE_APP_NAME` | `ExamPrep` | `APP.NAME`, document titles, Terms/Privacy copy |
| `VITE_APP_URL` | `http://localhost:5173` | `APP.URL` (share links, metadata) |
| `VITE_TRIAL_DAYS` | `90` | `APP.TRIAL_DAYS` — landing/marketing copy |
| `VITE_PRICE_PER_COURSE` | `150` | `APP.PRICE_PER_COURSE` — pricing copy |
| `VITE_CURRENCY` | `ETB` | `formatBirr()` |

Only `VITE_`-prefixed variables reach the client. Never put a secret here —
everything in this bundle is public. `.env`, `.env.local` and `.env.production`
are git-ignored; the `*.example` files are the committed templates.

`import.meta.env` is typed in `src/vite-env.d.ts` — add new variables there too
or TypeScript will reject them.

## Data layer

`lib/api.ts` is a thin `fetch` wrapper:

- `api.get/post/patch/put/delete<T>(path, body?, { query, headers, signal, auth })`
- `query` drops `undefined` / `null` / `''` values, so optional filters can be
  passed straight from state.
- `ApiError { status, message, code, details }` — `details` carries the Zod
  field-error map; `lib/errors.ts` has `getErrorMessage()` / `getFieldErrors()`.
- Tokens live in `localStorage` (`STORAGE_KEYS`). A `401` triggers **one**
  single-flight `POST /auth/refresh` and retries the original request; if the
  refresh fails, tokens are cleared and an `examprep:unauthorized` event is
  dispatched so `AuthContext` logs the user out.
- Pass `{ auth: false }` for public calls (login, register, OTP, reset).

Hooks: `useQuery(fetcher, deps, enabled)` → `{ data, loading, error, reload }`,
`useMutation(fn, { onSuccess, onError })` → `{ mutate, loading, error, reset }`.
`mutate` is referentially stable (fn/options are held in refs), so it is safe in
other hooks' dependency arrays.

## Routing & guards

`router/routes.ts` holds every path constant (`ROUTES.STUDENT.COURSE_DETAIL`, …)
— never hardcode a path in a page. `router/index.tsx` composes the tree:

- `PublicRoute` — auth pages; signed-in users are redirected to `ROLE_HOME[role]`
- `ProtectedRoute` — requires a stored token, remembers `location` as `state.from`
- `RoleGuard allow={[...]}` — per-role subtree; shows a spinner while `/auth/me`
  is still resolving, then `/unauthorized` if the role is not allowed
- `*` — `NotFound` (404), not the landing page

Post-login redirect only honours `state.from` when the signed-in role can
actually access it, so a student who follows an `/admin/...` link does not land
on a page that will immediately bounce to `/unauthorized`.

## Design tokens

`tailwind.config.ts` maps colours onto CSS variables defined in `index.css`, so
every token works with opacity modifiers (`bg-bg-surface/60`):

```
--bg-base --bg-surface --bg-elevated
--fg-default --fg-muted --fg-subtle --border
```

`.dark` overrides them (dark is the default — `index.html` ships
`<html class="dark">`); `ThemeContext` toggles the class, persists the choice in
`localStorage`, and updates `<meta name="theme-color">`.

Custom utilities live in `index.css` under `@layer utilities`: `focus-ring`,
`no-scrollbar`, `grid-bg`, `gradient-text`. Add new ones there rather than
inlining repeated class soup.

## PWA icons

Icons ship as **SVG** for size + quality on modern browsers. Android Chrome,
Edge, and Firefox install correctly. **Safari/iOS needs PNG** for a custom
home-screen icon — if you need that, generate them once:

```bash
# with ImageMagick
convert -background none public/pwa-192.svg -resize 192x192 public/pwa-192.png
convert -background none public/pwa-512.svg -resize 512x512 public/pwa-512.png
# maskable icon needs the safe-zone padding baked in
convert -background none public/pwa-maskable.svg -resize 512x512 public/pwa-maskable.png
```

Then add them to `vite.config.ts` (`includeAssets` + a `manifest.icons` entry
per size with `"type": "image/png"`), keeping the SVG entries — browsers pick
the best match. Apple devices additionally want, in `index.html`:

```html
<link rel="apple-touch-icon" href="/pwa-192.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

### Service-worker caching

`workbox.globPatterns` precaches **static assets only**. API responses are never
cached: they are user-specific, and a shared service worker cache would leak one
session's data to the next user of the same device. `navigateFallbackDenylist`
keeps `/api/*` out of the SPA fallback too. If you need offline data, store it
explicitly (IndexedDB) per user rather than via Workbox runtime caching.

## Tests

`vitest` + `happy-dom` + `@testing-library/react` (config: `vitest.config.ts`,
setup: `tests/setup.ts`).

```
tests/lib/api.test.ts              base URL, query building, auth header, error
                                   mapping, 204 handling, refresh-and-retry,
                                   logout event on refresh failure
tests/hooks/useMutation.test.ts    loading/error lifecycle, callbacks, and the
                                   stable-`mutate`-identity regression
tests/components/Tabs.test.tsx     controlled vs uncontrolled, onChange, disabled
                                   tabs, and the "active key disappeared" reset
tests/components/Button.test.tsx   render, click, loading/disabled
```

Run one file: `npx vitest run tests/lib/api.test.ts`. Coverage:
`npm run test:coverage` (v8 provider, reports to `coverage/`).

Note `@testing-library/dom` is an explicit devDependency — v16 of
`@testing-library/react` requires it as a peer and it is not installed
automatically when you use `--legacy-peer-deps`.

## Known gaps

- `src/types/index.ts` is a convenience barrel; most code imports from the
  specific `@/types/<domain>` module instead.
- `Tooltip` is CSS-only (no portal/positioning) — fine for toolbar icons, not
  for content that must escape an `overflow: hidden` parent.
- The dev payment simulator lives in the backend
  (`/api/payments/dev/:orderId/simulate-payment`); the payment modal opens it
  with `window.open` and polls `/status` every 3 s.
- There is no end-to-end suite yet; `scripts/smoke.sh` in the backend covers the
  API surface against a running stack.
