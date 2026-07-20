# Re:cord Deploy Status

기준 날짜: 2026-03-27  
성격: 현재 기준 배포/운영 readiness 요약

## 1. 현재 결론

로컬 검증은 상당 부분 통과했지만, 프로덕션 런칭 readiness는 아직 `운영 환경 정리 단계`다.

## 2. 최근 확인된 상태

- `npm run verify` 통과
- `npm run typecheck` 통과
- `npm run lint` 통과
- `npm run build` 통과
- `npm run smoke:local` 통과
- `npm run db:push:smoke` 통과
- `npm run preserve:syb2020:smoke` 통과
- `npm run secrets:check` 통과
- `NODE_ENV=production npm run preflight:prod` 실패

즉, 코드가 무너진 상태는 아니고 `production env와 rollout 절차`가 아직 닫히지 않은 상태다.

추가 메모:

- `syb2020` 라이브 프로필은 smoke DB로 복원 가능한 경로가 확인되었다.
- 기존 `prisma/dev.db`에는 legacy review columns 가 남아 있어 `db push` 시 data-loss 경고가 발생한다.
- 반면 새 smoke DB에는 현재 schema 가 정상 적용된다.

## 3. 현재 blocker

- production용 env 값 정리
- `NEXTAUTH_URL` / `NEXT_PUBLIC_URL` / `NEXTAUTH_SECRET` 확정
- 운영 DB baseline 적용 여부 확인
- 기존 dev/prod DB drift 정리 방식 확정
- remote smoke 계정과 토큰 준비
- Lemon checkout / webhook 최종 검증
- OCR를 런칭에 포함할지 여부 결정

## 4. 배포할 때 기준으로 볼 문서

- `GLOBAL_LAUNCH_READINESS.md`
- `PRODUCTION_OPERATOR_CHECKLIST.md`
- `PRODUCTION_MIGRATION_BASELINE.md`

## 5. 현재 판단

- 빠른 베타 오픈은 가능하다.
- 다만 “반복 가능한 운영 배포”라고 부르려면 blocker를 먼저 닫아야 한다.
- OCR와 이메일은 런칭 시점에 선택적으로 꺼둘 수 있다.

## 6. 다음 운영 작업

1. production env를 실제 값으로 확정
2. DB baseline 상태 점검
3. preview / prod smoke 루틴 고정
4. 결제 redirect와 webhook 실검증
5. 첫 운영 배포 절차를 문서대로 다시 리허설
