# Production Rollout Plan - 2026-03-07

## Goal
Safely promote Re:cord to production without breaking existing working flows.

## Success Criteria
- `npm run verify` passes locally
- `npm run secrets:check` passes locally
- `npm run ocr:fixtures` passes locally
- `npm run preflight:prod` passes with production env values
- production DB baseline is resolved before deploy
- `npx prisma migrate deploy` completes without drift
- Vercel preview smoke passes for `/`, `/login`, `/signup`, `/api/health`, `/<demo-username>`, `/<demo-username>/review-request`
- production smoke passes for the same routes via `npm run smoke:remote`
- auth, OCR, direct review request, and public profile all work after deploy

## Phase 1. Freeze and Backup
1. Stop schema changes until rollout is complete.
2. Snapshot current production database.
3. Export current Vercel environment variables for reference.
4. Confirm current live domain and canonical domain policy.

## Phase 2. Secret Rotation
1. Rotate `NEXTAUTH_SECRET`.
2. Rotate all production database URLs.
3. Rotate OAuth client secrets.
4. Rotate payment provider secrets.
5. Rotate email provider secrets.
6. Rotate `HEALTHCHECK_TOKEN`.
7. Re-enter fresh values into Vercel project settings.

## Phase 3. Production Environment Audit
Required envs:
- `NEXTAUTH_URL=https://www.recordyours.com`
- `NEXT_PUBLIC_URL=https://www.recordyours.com`
- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `NEXTAUTH_SECRET`
- `HEALTHCHECK_TOKEN`
- OCR credentials: `GOOGLE_VISION_API_KEY` or `GOOGLE_APPLICATION_CREDENTIALS`
- payment provider envs for whichever provider is active
- email provider envs if email is enabled

## Phase 4. Database Migration Cutover
1. Read `PRODUCTION_MIGRATION_BASELINE.md`.
2. If production DB was previously managed by `db push`, do not run baseline SQL directly.
3. Mark the baseline migration as already applied using `prisma migrate resolve --applied 20260307160000_baseline`.
4. Run `npx prisma migrate status`.
5. Verify there is no unexpected drift.

## Phase 5. Pre-Deploy Verification
1. Run `npm ci`.
2. Run `npm run verify`.
3. Run `npm run secrets:check`.
4. Run `npm run ocr:fixtures`.
5. Run `NODE_ENV=production npm run preflight:prod` with real production env values.
6. Check that `/api/health` reports `ok` or expected degraded warnings only.
7. Confirm `npm audit --omit=dev` has no high/critical vulnerabilities.

## Phase 6. Preview Deployment
1. Push the rollout branch.
2. Let GitHub Actions `ci.yml` run.
3. Deploy to Vercel preview.
4. Run preview smoke manually:
   - `/`
   - `/login`
   - `/signup`
   - `/api/health` with health token
   - `/stylist-demo`
   - `/stylist-demo/review-request`
5. Run `SMOKE_BASE_URL=<preview-url> SMOKE_HEALTH_TOKEN=<token> npm run smoke:remote`
6. Run `SMOKE_BASE_URL=<preview-url> SMOKE_HEALTH_TOKEN=<token> SMOKE_LOGIN_USERNAME=<smoke-user> SMOKE_LOGIN_PASSWORD=<smoke-password> npm run smoke:remote`
7. Auth check:
   - email signup/login
   - OAuth login if enabled
8. Product flow check:
   - dashboard loads
   - Reboot Pack loads
   - OCR upload endpoint returns expected state
   - public profile respects private/public setting
   - direct review request creates pending review only

## Phase 7. Production Deployment
1. Run `./deploy-production.sh` in a production-like shell with real envs.
2. Confirm:
   - `npx prisma migrate deploy` succeeds
   - build succeeds
   - no preflight hard failures
3. Promote the Vercel deployment.

## Phase 8. Post-Deploy Smoke
1. Open `https://www.recordyours.com/`.
2. Check `https://www.recordyours.com/api/health` with `x-health-token`.
3. Open live demo profile.
4. Submit one direct review request on demo profile.
5. Log in to dashboard and verify the pending review exists.
6. Toggle a profile from public -> private -> public and verify profile visibility changes correctly.
7. Run one OCR upload with real credentials enabled.
8. Run `SMOKE_BASE_URL=https://www.recordyours.com SMOKE_HEALTH_TOKEN=<token> npm run smoke:remote`
9. Run `SMOKE_BASE_URL=https://www.recordyours.com SMOKE_HEALTH_TOKEN=<token> SMOKE_LOGIN_USERNAME=<smoke-user> SMOKE_LOGIN_PASSWORD=<smoke-password> npm run smoke:remote`

## Phase 9. First 24 Hours Monitoring
1. Watch Vercel function errors.
2. Watch database connection errors.
3. Watch auth callback failures.
4. Watch OCR failures.
5. Watch payment webhook failures.
6. Watch review-request abuse/spam patterns.

## Rollback Rule
Rollback immediately if any of these happen:
- auth broken for new users
- public profile 5xx on live traffic
- database migration drift or missing columns
- OCR endpoint hard-fails for normal inputs after enabling production credentials
- payment success/webhook path fails

## Notes
- The app is code-ready for launch, but secret rotation and production DB baseline resolve are still manual external steps.
- Structured bulk import is intentionally CSV-only now.
- The automated smoke path uses an isolated SQLite smoke database and does not mutate the main local dev database.
