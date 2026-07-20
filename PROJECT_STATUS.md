# Re:cord Project Status

기준 날짜: 2026-03-27  
성격: 현재 제품/운영 상태를 빠르게 파악하기 위한 최신 상태 요약

## 1. 한 줄 상태

Re:cord는 `리뷰 OCR SaaS`에서 `상담 전에 보내는 공개 신뢰 링크`로 중심을 옮긴 뒤, 제품 코어는 많이 올라왔고 문서/운영/정리 작업을 마무리하는 단계에 있다.

## 2. 현재 전략

- 현재 핵심 결과물은 `공개 프로필 링크`다.
- 가장 선명한 wedge는 `헤어디자이너`다.
- 중요한 것은 후기 수집량보다 `대표 후기`, `작업 사진`, `상담 CTA`, `공유 행동`이다.
- OCR, bulk upload, migration concierge는 메인 정체성이 아니라 보조 레이어다.

관련 문서:

- `START_HERE.md`
- `CURRENT_TRUTH_2026-03-27.md`
- `FEATURE_KEEP_HIDE_CUT_MATRIX_2026-03-27.md`

## 3. 지금 실제로 강한 영역

- 공개 프로필 생성/노출
- 리뷰 CRUD와 공개/비공개 제어
- 프로필 편집과 미리보기
- 공유 플로우
- 직접 후기 요청 링크와 pending 검토 흐름
- 관리자 운영 도구와 지원 티켓

## 4. 아직 마무리가 필요한 영역

- `대표 후기 3개`를 제품 레벨에서 명확히 다루는 구조
- 프로필 편집 화면의 우선순위 정리
- pricing / onboarding / 지원 카피의 전략 정렬
- 플랜/구독 로직의 단일 기준화
- 결제 provider 흔적 정리
- dev/prod Prisma 스키마 이중 관리 정리

## 5. 현재 검증 상태

최근 로컬 기준으로 확인된 상태:

- `npm run verify` 통과
- `npm run smoke:local` 통과
- `npm run secrets:check` 통과
- `NODE_ENV=production npm run preflight:prod` 실패

즉, 로컬 기준 제품/코드는 꽤 안정적이지만 프로덕션 런칭 readiness는 아직 운영 환경 정리가 남아 있다.

## 6. 현재 런칭 blocker

- 실제 production env 값 정리
- `NEXTAUTH_URL`, `NEXT_PUBLIC_URL`, `NEXTAUTH_SECRET` 재확인
- OCR를 켤지 끌지에 대한 런칭 결정
- 운영 DB baseline 정리
- remote smoke 기준 확립
- Lemon checkout/webhook 최종 점검

운영 기준 문서:

- `DEPLOY_STATUS.md`
- `GLOBAL_LAUNCH_READINESS.md`
- `PRODUCTION_OPERATOR_CHECKLIST.md`
- `PRODUCTION_MIGRATION_BASELINE.md`

## 7. 지금 보지 않아야 할 방향

아래는 당장 핵심 우선순위가 아니다.

- 범용 직군 전체로 메시지 확장
- 고급 통계 확장
- Reboot/Customize 축 확장
- 과도한 테마/커스텀 옵션 확대
- OCR를 제품 정체성으로 다시 올리는 일

## 8. 바로 이어서 해야 할 일

1. 대표 후기 개념을 제품에 명시적으로 넣는다.
2. 프로필 편집과 공유 플로우를 더 짧게 만든다.
3. 배포/운영 기준을 실제 production 값 기준으로 닫는다.
4. 플랜/결제/스키마의 중복 기준을 정리한다.
5. 헤어디자이너 wedge에 맞는 데모/온보딩/세팅 흐름을 더 날카롭게 만든다.
