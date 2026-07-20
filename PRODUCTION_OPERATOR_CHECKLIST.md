# Production Operator Checklist

This checklist is for the human production rollout step. It assumes the codebase already passes local verification and the operator is deploying `main`.

## 1. Freeze

1. Stop schema changes.
2. Stop env var churn during rollout.
3. Confirm the commit SHA to deploy.

## 2. Rotate Secrets

Rotate and re-enter these values in Vercel before deployment:

1. `NEXTAUTH_SECRET`
2. `DATABASE_URL`
3. `DATABASE_URL_UNPOOLED`
4. `POSTGRES_URL`
5. `POSTGRES_PRISMA_URL`
6. `GOOGLE_CLIENT_ID`
7. `GOOGLE_CLIENT_SECRET`
8. `KAKAO_CLIENT_ID`
9. `KAKAO_CLIENT_SECRET`
10. `SENDGRID_API_KEY` or `RESEND_API_KEY`
11. `LEMONSQUEEZY_SIGNING_SECRET`
12. `NEXT_PUBLIC_LEMONSQUEEZY_PREMIUM_CHECKOUT_URL`
13. `NEXT_PUBLIC_LEMONSQUEEZY_PRO_CHECKOUT_URL`
14. Yearly 판매 시 `NEXT_PUBLIC_LEMONSQUEEZY_PREMIUM_YEARLY_CHECKOUT_URL`
15. Yearly 판매 시 `NEXT_PUBLIC_LEMONSQUEEZY_PRO_YEARLY_CHECKOUT_URL`
16. Variant 기반 매핑을 쓸 경우 `LEMONSQUEEZY_*_VARIANT_ID`
17. `HEALTHCHECK_TOKEN`

## 3. Confirm Required Environment Variables

Required production values:

1. `NODE_ENV=production`
2. `NEXTAUTH_URL=https://www.recordyours.com`
3. `NEXT_PUBLIC_URL=https://www.recordyours.com`
4. `ENABLE_OCR=true` only if OCR credentials are configured
5. `ENABLE_OCR=false` is acceptable for launch if OCR is not ready
6. `ENABLE_EMAIL=true` only if mail provider credentials are configured
7. `ENABLE_EMAIL=false` is acceptable for launch if outbound mail is not ready
8. `GOOGLE_APPLICATION_CREDENTIALS_JSON` or equivalent OCR credential source when OCR is enabled

## 4. Run Local Release Gates

From the repo root:

1. `npm ci`
2. `npm run verify`
3. `npm run secrets:check`
4. `npm run ocr:fixtures`
5. `npm run audit:prod`
6. `NODE_ENV=production npm run preflight:prod`
7. `npm run db:push:smoke && npm run seed:demo:smoke`
8. `npm run smoke:local`

Any failure blocks release.

## 5. Production DB Baseline

If production DB was previously managed by `prisma db push`, do not run raw baseline SQL manually.

1. Read [PRODUCTION_MIGRATION_BASELINE.md](/Users/bin/Documents/for%20bin/record/PRODUCTION_MIGRATION_BASELINE.md).
2. Take a DB snapshot first.
3. Run `npx prisma migrate status`.
4. Mark the baseline migration as applied with `prisma migrate resolve --applied`.
5. Re-run `npx prisma migrate status`.

Release is blocked until migrate status is clean.

## 6. Preview Deployment Checks

After preview deploy:

1. Open `/`
2. Open `/login`
3. Open `/signup`
4. Open `/stylist-demo`
5. Open `/stylist-demo/review-request`
6. Open `/api/health` with `x-health-token`
7. Open `/pricing` and confirm Premium/Pro buttons redirect to Lemon checkout
8. Open `/pricing/upgrade` and confirm the same redirect behavior

Functional checks:

1. Sign up with a new account
2. Confirm redirect to `/dashboard/reboot?from=signup`
3. Upload at least one OCR image if `ENABLE_OCR=true`
4. Create one direct review request
5. Submit one direct review
6. Confirm pending review appears in dashboard
7. Toggle profile public -> private -> public
8. Complete one real or test Lemon checkout and confirm webhook delivery succeeds

## 7. Production Deployment

1. Run `./deploy-production.sh`
2. Confirm `prisma migrate deploy` completes
3. Confirm Vercel build is green
4. Promote the deployment
5. Run `SMOKE_BASE_URL=https://www.recordyours.com SMOKE_HEALTH_TOKEN=... npm run smoke:remote`
6. Run `SMOKE_BASE_URL=https://www.recordyours.com SMOKE_HEALTH_TOKEN=... SMOKE_LOGIN_USERNAME=<smoke-user> SMOKE_LOGIN_PASSWORD=<smoke-password> npm run smoke:remote`

## 8. Post-Deploy Smoke

Immediately verify:

1. `GET /`
2. `GET /api/health` with token
3. `GET /stylist-demo`
4. `GET /stylist-demo/review-request`
5. Sign in with a real account
6. Open dashboard
7. Run one OCR upload if `ENABLE_OCR=true`
8. Submit one direct review
9. Approve one pending direct review

## 9. Rollback Triggers

Rollback or pause traffic if any of these happen:

1. Auth callback failures
2. DB connection failures
3. `prisma migrate deploy` error
4. OCR returns 5xx for valid requests
5. Direct review request route returns 5xx
6. Public profile visibility rules break

## 10. First 24 Hours

Monitor:

1. Auth error rate
2. OCR failure rate
3. Payment webhook failures
4. Review request spam attempts
5. Unexpected 500s in profile or dashboard routes
6. Lemon checkout link misconfiguration or missing yearly links
