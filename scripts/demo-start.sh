#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

PORT=3034

PIDS="$(lsof -tiTCP:${PORT} -sTCP:LISTEN || true)"
if [[ -n "${PIDS}" ]]; then
  echo "Stopping existing demo server on port ${PORT}: ${PIDS}"
  kill ${PIDS} || true
  sleep 1
fi

rm -rf .next .next-dev

env DATABASE_URL="file:/tmp/record-smoke.db" npx prisma generate --schema=prisma/schema.dev.prisma
env DATABASE_URL="file:/tmp/record-smoke.db" npx prisma db push --schema=prisma/schema.dev.prisma
env DATABASE_URL="file:/tmp/record-smoke.db" DEMO_SEED_CONFIRM=YES npx tsx scripts/setup-demo-data.ts
env DATABASE_URL="file:/tmp/record-smoke.db" npx next dev --port ${PORT}
