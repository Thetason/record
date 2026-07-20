# Global Launch Readiness

이 문서는 Re:cord를 `파일럿 가능한 상태`에서 `반복 배포 가능한 상태`로 운영하기 위한 기준 문서입니다.

## 자동 검증

다음 검증은 코드에 고정되어 있습니다.

- `npm run lint`
- `npm run build`
- `npm run typecheck`
- `npm run verify`
- `npm run ocr:fixtures`
- `npm run smoke:local`
- `npm run secrets:check`
- `SMOKE_BASE_URL=https://preview-or-prod npm run smoke:remote`
- GitHub Actions CI: `.github/workflows/ci.yml`
- 프로덕션 preflight: `npm run preflight:prod`

## 런칭 전 필수 수동 체크

### 1. 시크릿 회전

다음 값은 저장소 히스토리에 노출됐을 가능성이 있으므로 실제 운영값을 반드시 새로 발급해야 합니다.

- `NEXTAUTH_SECRET`
- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- OAuth client secrets
- `LEMONSQUEEZY_SIGNING_SECRET`
- Lemon checkout URLs
- 이메일 provider secrets
- `HEALTHCHECK_TOKEN`

### 2. 운영 DB baseline 적용

기존 운영 DB가 `db push` 기반이었다면 바로 `migrate deploy` 하면 안 됩니다.

1. `PRODUCTION_MIGRATION_BASELINE.md`를 먼저 읽습니다.
2. 운영 DB 백업을 뜹니다.
3. baseline을 `resolve --applied`로 맞춥니다.
4. 그 다음부터만 `migrate deploy`를 사용합니다.

### 3. 운영 OCR

프로덕션에서는 mock OCR이 막혀 있습니다.

다음 중 하나가 반드시 있어야 합니다.

- `GOOGLE_VISION_API_KEY`
- `GOOGLE_APPLICATION_CREDENTIALS`

빠른 베타 런칭이 우선이라면 `ENABLE_OCR=false` 로 먼저 열 수 있습니다.

### 4. 운영 도메인

- `NEXTAUTH_URL=https://www.recordyours.com`
- `NEXT_PUBLIC_URL=https://www.recordyours.com`
- `www` / apex 중 canonical 한쪽 기준 통일

## 현재 보안 메모

- 구조화 일괄 업로드는 현재 `CSV only`입니다.
- 공개 health endpoint는 프로덕션에서 기본적으로 상세 내부정보를 숨깁니다.
- `/api/auth/test`는 프로덕션에서 `404`입니다.
- 공개 회원가입은 더 이상 `super_admin`을 생성하지 않습니다.

## 배포 순서

1. `npm ci`
2. `npm run verify`
3. `npm run secrets:check`
4. `npm run ocr:fixtures`
5. `NODE_ENV=production npm run preflight:prod`
6. DB baseline resolve 또는 migrate status 확인
7. `npx prisma migrate deploy`
8. Vercel preview smoke test
9. `/pricing`, `/pricing/upgrade` 에서 Lemon checkout redirect 확인
10. Lemon webhook test event 또는 실제 테스트 결제 1건 확인
11. `SMOKE_BASE_URL=https://www.recordyours.com SMOKE_HEALTH_TOKEN=... npm run smoke:remote`
12. `SMOKE_BASE_URL=https://www.recordyours.com SMOKE_HEALTH_TOKEN=... SMOKE_LOGIN_USERNAME=<smoke-user> SMOKE_LOGIN_PASSWORD=<smoke-password> npm run smoke:remote`

## 런칭 불가 조건

아래 중 하나라도 충족되면 런칭하면 안 됩니다.

- `npm run verify` 실패
- `npm run secrets:check` 실패
- `npm run ocr:fixtures` 실패
- `npm run preflight:prod` 실패
- `npm run smoke:remote` 실패
- 운영 DB baseline 미정리
- Vision credentials 미설정
- 시크릿 미회전
- Lemon checkout URL 또는 webhook secret 미설정
