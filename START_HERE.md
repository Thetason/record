# Re:cord Start Here

기준 날짜: 2026-03-27 (섹션 0은 2026-07-03 갱신)
목적: 앞으로 이 저장소를 볼 때 어떤 문서를 먼저 읽어야 하는지, 무엇이 현재 기준이고 무엇이 과거 기록인지 한 번에 구분하기 위한 진입 문서

> 이 프로젝트는 obiwan/vocal_trainer 와 **완전히 별개**다(각자 다른 git repo). record 작업은 이 폴더에서 진행하고, record 지식은 이 repo 안 문서에 보존한다.

---

## 0. 가장 최신 (2026-07-03 세션) — 여기부터 본다

아래 두 문서가 각자 주제에서 가장 최신 기준이며, 오래된 상태 문서보다 우선한다.

- **`VIABILITY_VERDICT_2026-07-03.md`** — 사업성 냉철 판정 + 30일 캐시 플랜(레슨 wedge 전환·세팅 패키지 15만원·수동 결제). 판정일 2026-08-02(유료 3명 기준). 이전 전략 문서 전부에 우선.
- **`AUTO_IMPORT_STRATEGY_2026-07-03.md`** — "리뷰 자동 이관"의 기술·법률 확정 + 실제 구현. 서버 크롤링 금지(판례 근거), 대신 "긴 캡처 1장 → 리뷰 여러 개" 멀티모달 OCR 구현 완료.

2026-07-03 세션에서 추가/수정된 코드(미커밋·미배포):
- 가입 크래시 버그 수정(avatar 이니셜→next/image), Lemon USD 체크아웃 기본 비활성화(컨시어지 라우팅), metadataBase, 취약점 축소.
- 리뷰 한 번에 가져오기: `lib/claude-vision.ts`(Claude 비전 다중 추출) · `lib/review-platforms.ts`(플랫폼별 해부 프로필: 네이버·카카오·당근·숨고·크몽·DM) · `app/api/ocr/multi` · `app/api/reviews/import` · `app/dashboard/import/page.tsx`.
- 2026-07-20 모델 실측(상세: AUTO_IMPORT_STRATEGY): 기본 모델 = **claude-fable-5**(열화 캡처에서 본문 정합 100%, opus는 81~84%로 환각). haiku는 한글 붕괴로 금지. 폴백: refusal→opus 서버사이드, 조직 400→opus 클라이언트 재시도. 재검증은 `scripts/test-vision-extract.ts`.
- 배포 전 필수: 프로덕션에 `ANTHROPIC_API_KEY` 세팅, prod DB에 `scripts/fix-legacy-avatar-initials.ts` 실행.

---

## 1. 지금 이 프로젝트를 한 줄로 말하면

Re:cord는 `상담 전에 보내는 공개 신뢰 링크`를 만드는 제품이다.

지금 제품의 중심은:

- 공개 프로필
- 대표 후기
- 작업 사진
- 상담/예약 CTA
- 공유 링크
- 직접 후기 요청

이다.

OCR, bulk import, migration concierge는 여전히 중요하지만 `메인 제품 정체성`이 아니라 `보조 레이어`다.

---

## 2. 문서가 충돌할 때 읽는 순서

아래 순서를 현재 기준으로 사용한다.

1. `README.md`
2. `PROJECT_STATUS.md`
3. `CURRENT_TRUTH_2026-03-27.md`
4. `FEATURE_KEEP_HIDE_CUT_MATRIX_2026-03-27.md`
5. `DEVELOPMENT_ROADMAP.md`
6. `LIVE_PROFILE_PRESERVATION.md`
7. `DEPLOY_STATUS.md`
8. `GLOBAL_LAUNCH_READINESS.md`
9. `PRODUCTION_OPERATOR_CHECKLIST.md`
10. `PRODUCTION_MIGRATION_BASELINE.md`
11. `HAIR_OUTBOUND_PLAYBOOK.md`

---

## 3. 각 문서의 역할

- `README.md`
  - 외부/내부 모두를 위한 가장 짧은 제품 소개
- `PROJECT_STATUS.md`
  - 현재 제품 상태와 지금 막혀 있는 것
- `CURRENT_TRUTH_2026-03-27.md`
  - 제품 정체성과 전략 기준
- `FEATURE_KEEP_HIDE_CUT_MATRIX_2026-03-27.md`
  - 기능을 유지/숨김/중단 중 무엇으로 볼지 결정하는 표
- `DEVELOPMENT_ROADMAP.md`
  - 이제 실제로 뭘 개발할지에 대한 현재 우선순위
- `LIVE_PROFILE_PRESERVATION.md`
  - `syb2020` 같은 라이브 founder profile 보존 기준과 복원 경로
- `DEPLOY_STATUS.md`
  - 현재 런칭/배포 readiness 상태
- `GLOBAL_LAUNCH_READINESS.md`
  - 배포 전에 통과해야 하는 전역 기준
- `PRODUCTION_OPERATOR_CHECKLIST.md`
  - 사람이 실제 배포할 때 따라야 하는 순서
- `PRODUCTION_MIGRATION_BASELINE.md`
  - 운영 DB를 `migrate deploy` 체계로 맞추는 방법
- `HAIR_OUTBOUND_PLAYBOOK.md`
  - 현재 wedge인 헤어디자이너 아웃바운드 가이드

---

## 4. 과거 기록으로 내려간 문서

아래 문서들은 `히스토리 보관용`이다. 읽을 수는 있지만 현재 판단 기준으로 쓰면 안 된다.

- `REAL_STATUS.md`
- `PROJECT_STATUS_BRIEFING.md`
- `FINAL_CHECK.md`
- `PRODUCTION_READY_STATUS.md`
- `PRODUCTION_LAUNCH_GUIDE.md`
- `LAUNCH_CHECKLIST.md`
- `PRODUCTION_VERIFICATION_CHECKLIST.md`

이 문서들에는 가능한 한 상단에 경고를 남겨두었다.

---

## 5. 앞으로 문서를 읽을 때 지켜야 할 규칙

1. 날짜가 오래된 상태 문서는 기본적으로 과거 스냅샷으로 본다.
2. `OCR 중심 제품`, `토스 결제 중심`, `범용 리뷰 통합 SaaS` 표현은 현재 기준 문구가 아니다.
3. 기능 추가 여부는 먼저 `FEATURE_KEEP_HIDE_CUT_MATRIX_2026-03-27.md`로 판단한다.
4. 라이브 실사용 프로필 보호가 걸린 작업은 `LIVE_PROFILE_PRESERVATION.md`를 먼저 본다.
5. 새 작업을 시작할 때는 `PROJECT_STATUS.md`와 `DEVELOPMENT_ROADMAP.md`를 먼저 본다.
6. 운영/배포 작업은 `DEPLOY_STATUS.md`와 `GLOBAL_LAUNCH_READINESS.md`를 먼저 본다.
