#!/usr/bin/env bash
# End-to-end smoke test against a running API.
# Usage: bash scripts/smoke.sh [BASE_URL]
#
# Requires: curl, jq, and a seeded database (npm run prisma:seed).
set -uo pipefail

BASE="${1:-http://localhost:4000}"

for bin in curl jq; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "❌ '$bin' is required but not installed."
    exit 1
  fi
done

FAILURES=0
pass() { printf '  %-28s ✓\n' "$1"; }
fail() { printf '  %-28s ✗ %s\n' "$1" "$2"; FAILURES=$((FAILURES + 1)); }

# expect_get <label> <path> [token]
expect_get() {
  local label="$1" path="$2" token="${3:-}"
  local args=(-s -o /dev/null -w '%{http_code}' "$BASE$path")
  [ -n "$token" ] && args+=(-H "Authorization: Bearer $token")
  local code
  code="$(curl "${args[@]}")"
  if [ "$code" = "200" ]; then pass "$label"; else fail "$label" "HTTP $code"; fi
}

echo "▶ Smoke testing $BASE"
echo ""

# ─── Health ───────────────────────────────────────────────────────────────
expect_get "health/live" "/api/health/live"
expect_get "health (info)" "/api/health"

READY_CODE="$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/health/ready")"
if [ "$READY_CODE" = "200" ]; then
  pass "health/ready (db up)"
else
  fail "health/ready" "HTTP $READY_CODE — is MySQL running and DATABASE_URL correct?"
fi

# ─── Auth ─────────────────────────────────────────────────────────────────
login() {
  curl -s -X POST "$BASE/api/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"identifier\":\"$1\",\"password\":\"$2\"}" | jq -r '.accessToken // empty'
}

STUDENT_TOKEN="$(login student@examprep.local Student1234)"
if [ -n "$STUDENT_TOKEN" ]; then pass "login (student)"; else fail "login (student)" "no accessToken — seeded?"; fi

ADMIN_TOKEN="$(login admin@examprep.local Admin1234)"
if [ -n "$ADMIN_TOKEN" ]; then pass "login (admin)"; else fail "login (admin)" "no accessToken — seeded?"; fi

# ─── Student surface ──────────────────────────────────────────────────────
if [ -n "$STUDENT_TOKEN" ]; then
  expect_get "auth/me" "/api/auth/me" "$STUDENT_TOKEN"
  expect_get "subjects" "/api/subjects" "$STUDENT_TOKEN"
  expect_get "courses" "/api/courses" "$STUDENT_TOKEN"
  expect_get "papers" "/api/papers" "$STUDENT_TOKEN"
  expect_get "attempts" "/api/attempts" "$STUDENT_TOKEN"
  expect_get "analytics/overview" "/api/analytics/me/overview" "$STUDENT_TOKEN"
  expect_get "me/preferences" "/api/me/preferences" "$STUDENT_TOKEN"
fi

# ─── Admin surface ────────────────────────────────────────────────────────
if [ -n "$ADMIN_TOKEN" ]; then
  expect_get "admin/overview" "/api/admin/overview" "$ADMIN_TOKEN"
  expect_get "admin/users" "/api/admin/users" "$ADMIN_TOKEN"
  expect_get "admin/orders" "/api/admin/orders" "$ADMIN_TOKEN"
  expect_get "admin/audit" "/api/admin/audit" "$ADMIN_TOKEN"
  expect_get "teacher/overview (admin)" "/api/teacher/overview" "$ADMIN_TOKEN"
fi

# ─── Guards: these must NOT be 200 ────────────────────────────────────────
expect_denied() {
  local label="$1" path="$2" want="$3"
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' "$BASE$path")"
  if [ "$code" = "$want" ]; then pass "$label"; else fail "$label" "HTTP $code, expected $want"; fi
}
expect_denied "admin blocked w/o token" "/api/admin/overview" "401"
expect_denied "student blocked on admin" "/api/admin/users" "401"

# A student token must not reach the admin surface (403, not 200)
if [ -n "$STUDENT_TOKEN" ]; then
  CODE="$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/admin/overview" -H "Authorization: Bearer $STUDENT_TOKEN")"
  if [ "$CODE" = "403" ]; then pass "student → admin is 403"; else fail "student → admin is 403" "HTTP $CODE"; fi
fi

# Malformed JSON must return a JSON 400 (not an HTML error page)
BAD_JSON="$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/auth/login" \
  -H 'Content-Type: application/json' -d '{"identifier": broken}')"
if [ "$BAD_JSON" = "400" ]; then pass "malformed JSON → 400"; else fail "malformed JSON → 400" "HTTP $BAD_JSON"; fi

# Every response should carry a request id
REQ_ID="$(curl -s -D - -o /dev/null "$BASE/api/health" | grep -i '^x-request-id:' | tr -d '\r')"
if [ -n "$REQ_ID" ]; then pass "X-Request-Id header"; else fail "X-Request-Id header" "missing"; fi

echo ""
if [ "$FAILURES" -eq 0 ]; then
  echo "✅ Smoke test complete — all checks passed."
  exit 0
else
  echo "💥 Smoke test finished with $FAILURES failure(s)."
  exit 1
fi
