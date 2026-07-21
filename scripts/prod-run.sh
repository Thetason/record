#!/bin/sh
# Prod maintenance runner — loads prod DATABASE_URL from the local Vercel env
# file and runs a repo script under scripts/ with it.
#
# Usage:
#   sh scripts/prod-run.sh fix-legacy-avatar-initials.ts            # dry run
#   sh scripts/prod-run.sh --confirm fix-legacy-avatar-initials.ts  # apply
set -e
cd "$(dirname "$0")/.."

if [ "$1" = "--confirm" ]; then
  export AVATAR_FIX_CONFIRM=YES
  shift
fi

if [ -z "$1" ]; then
  echo "usage: sh scripts/prod-run.sh [--confirm] <script-name.ts>" >&2
  exit 1
fi

DATABASE_URL=$(grep -E '^DATABASE_URL=' .env.vercel.production.local | head -1 | cut -d= -f2- | tr -d '"')
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL not found in .env.vercel.production.local" >&2
  exit 1
fi
export DATABASE_URL

exec npx tsx "scripts/$1"
