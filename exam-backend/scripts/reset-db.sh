#!/usr/bin/env bash
# Reset the local dev database: drop + migrate + seed-all.
# WARNING: destroys all data.
set -euo pipefail

echo "⚠️  This will DROP all data in the dev database."
read -rp "Type RESET to continue: " confirm
if [ "$confirm" != "RESET" ]; then
  echo "Aborted."
  exit 1
fi

echo "▶ Running prisma migrate reset…"
npx prisma migrate reset --force

echo "▶ Seeding base data…"
npm run prisma:seed

echo "▶ Seeding mentor data…"
npm run prisma:seed:mentor

echo "▶ Seeding teacher data…"
npm run prisma:seed:teacher

echo "▶ Seeding admin data…"
npm run prisma:seed:admin

echo ""
echo "✅ Database reset + seeded."
