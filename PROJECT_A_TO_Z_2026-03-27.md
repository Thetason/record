# Re:cord Project A to Z

기준 날짜: 2026-03-27  
작성 위치: `/Users/bin/Documents/for bin/record`  
성격: 현재 프로젝트의 가장 최신 맥락을 빠르게 이어받기 위한 운영 문서

---

## 1. 한 줄 정의

Re:cord는 `흩어진 리뷰를 소개 전에 보내는 내 링크 한 장`을 만드는 서비스다.  
더 정확히 말하면, `전문가가 샵을 옮기거나 독립해도 이전 신뢰를 잃지 않게 해주는 공개 신뢰 프로필`이다.

---

## 2. 지금 우리가 실제로 만들고 있는 것

초기의 Re:cord는 `리뷰 통합 SaaS`, `OCR 업로드 도구`, `후기 아카이브` 성격이 강했다.  
하지만 2026년 3월 기준으로 제품 중심은 아래로 이동했다.

- 리뷰 저장소가 아니라 `영업 도구`
- 예쁜 대시보드가 아니라 `상담 전에 보내는 링크`
- 자동화/OCR보다 `공개 프로필의 설득력`
- 많이 넣는 제품보다 `30초 안에 신뢰가 생기는 제품`

즉, 현재 Re:cord의 핵심은:

`이 링크를 보내면 고객이 샵 간판보다 먼저 사람의 실력과 신뢰를 본다.`

---

## 3. 제품 철학

### 3-1. 왜 존재하는가

프리랜서, 특히 헤어디자이너/강사/트레이너/개인 서비스업 종사자는 이전 직장, 샵, 브랜드 간판에 기대지 못하는 순간이 온다.  
그때 가장 먼저 사라지는 건 실력이 아니라 `증명 수단`이다.

Re:cord는 그 증명 수단을 다시 만든다.

- 네이버에 흩어진 후기
- 카카오/당근에 흩어진 후기
- 직접 받은 후기
- 작업 사진
- 간단한 소개

이걸 한 링크에 정리해서, 고객이 예약 전에 바로 납득하게 한다.

### 3-2. 우리가 믿는 원칙

- 설명보다 증거가 먼저다.
- 후기 수보다 대표 후기 3개가 더 중요하다.
- 기능 수보다 공유되는 링크 1개가 더 중요하다.
- 입력 자동화보다 공개 프로필의 완성도가 더 중요하다.
- 넓은 타깃보다 선명한 버티컬이 더 중요하다.

---

## 4. 현재 포지셔닝

현재 가장 맞는 포지셔닝 문장:

- `샵을 옮겨도 신뢰까지 다시 시작하지 않게 만드는 공개 프로필`
- `상담 전에 보내는 프리랜서용 신뢰 링크`
- `흩어진 리뷰를 소개 전에 보내는 내 링크 한 장`

피해야 하는 표현:

- 리뷰 통합 플랫폼
- OCR 기반 자동 리뷰 등록 서비스
- 후기 아카이브 SaaS
- 모든 프리랜서를 위한 범용 포트폴리오 툴

이 표현들은 제품의 핵심을 흐린다.

---

## 5. 초기 타깃

현재 가장 적합한 wedge는 `헤어디자이너`다.

이유:

- 샵 이동, 독립, 1인샵 오픈 같은 신뢰 단절 순간이 선명하다.
- 리뷰 설득력이 매우 높다.
- 소개/예약/상담 전환과 공개 프로필의 연결이 강하다.
- 링크를 실제로 카카오톡, 인스타, DM, 공지에 보내는 장면이 분명하다.

확장 후보는 이후:

- PT / 트레이너
- 보컬/음악 레슨
- 네일/뷰티
- 크몽 기반 프리랜서

하지만 현재 기준으로는 `헤어디자이너 first`가 맞다.

---

## 6. MVP 정의

대표 조언과 현재 전략을 기준으로 한 MVP는 아래다.

### 반드시 필요한 것

- 이름
- 사용자명 / 고유 URL
- 전문 분야 한 줄
- 경력/소개 요약
- 대표 후기 3개
- 리뷰 캡처 이미지
- 리뷰 원문 링크
- 작업 사진 2장 이상
- 상담/예약 버튼
- 공개/비공개 토글
- 링크 복사 / 카카오 / 인스타·스레드 / QR 공유

### 있으면 좋지만 지금 코어는 아닌 것

- OCR 자동 추출
- 대량 업로드
- 커스텀 테마
- intro video
- custom CSS
- 복잡한 통계
- 관리자 고도화
- 다중 세그먼트용 랜딩 다수

### 지금 하지 말아야 할 것

- 너무 넓은 직군 대응
- 자동화 중심 메시지
- 복잡한 설정/커스터마이징 우선
- 대시보드 기능 확장

---

## 7. 현재 구현 상태 요약

### 7-1. 이미 구현된 핵심

1. 홈 랜딩
- 제품의 주인공을 `공개 링크 1장`으로 재정렬
- 리뷰 증거 중심 히어로
- 샘플 페이지로 연결
- 링크/신뢰/작업 사진 중심 메시지로 정리

관련 파일:
- `/Users/bin/Documents/for bin/record/app/HomePageClient.tsx`
- `/Users/bin/Documents/for bin/record/app/page.tsx`

2. 공개 프로필
- 대표 후기 우선 정렬
- direct / verified / image / originalUrl 기반 가중 정렬
- 리뷰 이미지 확대
- 원문 링크 노출
- 작업 사진 노출
- CTA 노출

관련 파일:
- `/Users/bin/Documents/for bin/record/app/[username]/ProfileClient.tsx`
- `/Users/bin/Documents/for bin/record/app/api/profile/[username]/route.ts`
- `/Users/bin/Documents/for bin/record/app/api/public/reviews/[username]/route.ts`

3. 프로필 편집
- 이름, 사용자명, bio, website, phone
- avatar 업로드
- portfolioImages 업로드/삭제/저장
- 공개 미리보기
- 공개 상태 체크

관련 파일:
- `/Users/bin/Documents/for bin/record/app/dashboard/profile/page.tsx`
- `/Users/bin/Documents/for bin/record/app/api/users/me/route.ts`
- `/Users/bin/Documents/for bin/record/app/api/users/me/preview/route.ts`
- `/Users/bin/Documents/for bin/record/app/api/upload/route.ts`

4. 리뷰 관리
- 리뷰 생성/수정/삭제
- direct review request
- 대표 후기 정리
- public review submission flow

관련 파일:
- `/Users/bin/Documents/for bin/record/app/dashboard/reviews/page.tsx`
- `/Users/bin/Documents/for bin/record/app/dashboard/reviews/edit/[id]/page.tsx`
- `/Users/bin/Documents/for bin/record/app/[username]/review-request/page.tsx`
- `/Users/bin/Documents/for bin/record/app/[username]/review-request/ReviewRequestForm.tsx`
- `/Users/bin/Documents/for bin/record/app/api/reviews/route.ts`
- `/Users/bin/Documents/for bin/record/app/api/public/reviews/[username]/route.ts`

5. 공유
- 링크 복사
- 소개 멘트 복사
- 카카오 공유
- 인스타·스레드용 복사
- QR 다운로드

관련 파일:
- `/Users/bin/Documents/for bin/record/app/dashboard/share/page.tsx`

6. 결제
- 현재 결제 시작 경로는 Lemon Squeezy 기준으로 정리됨
- checkout URL helper 정리
- Lemon webhook 존재

관련 파일:
- `/Users/bin/Documents/for bin/record/lib/lemonsqueezy.ts`
- `/Users/bin/Documents/for bin/record/app/api/checkout/route.ts`
- `/Users/bin/Documents/for bin/record/app/api/payments/checkout/route.ts`
- `/Users/bin/Documents/for bin/record/app/api/webhooks/lemonsqueezy/route.ts`
- `/Users/bin/Documents/for bin/record/app/pricing/page.tsx`
- `/Users/bin/Documents/for bin/record/app/pricing/upgrade/page.tsx`

### 7-2. 방향은 바뀌었지만 아직 살아 있는 구형 축

아래는 현재 제품 중심축과 완전히 맞지 않지만 repo 안에는 여전히 살아 있는 영역이다.

- OCR API
- bulk upload
- migration request / concierge 세팅 흐름
- reboot/customize 잔재
- 과거형 문서와 카피 일부
- 넓은 타깃을 전제로 한 일부 페이지

대표 파일:
- `/Users/bin/Documents/for bin/record/app/api/ocr/route.ts`
- `/Users/bin/Documents/for bin/record/app/dashboard/bulk-upload/page.tsx`
- `/Users/bin/Documents/for bin/record/app/migration-request/page.tsx`
- `/Users/bin/Documents/for bin/record/app/dashboard/customize/page.tsx`
- `/Users/bin/Documents/for bin/record/app/dashboard/reboot/page.tsx`

주의:
지금 이 기능들이 코드에 있다는 사실 자체는 런칭 blocker가 아니다.  
문제는 이 기능들이 `메인 제품으로 보이면` 안 된다는 점이다.

---

## 8. 2026-03-27 기준으로 최근에 정리된 방향

이번 정리에서 반영한 핵심:

- 홈/대시보드/공유를 `신뢰 링크` 중심으로 재정렬
- 포트폴리오 이미지 기능을 실제 데이터 흐름에 연결
- 대시보드의 중심을 `프로필 완성 -> 대표 후기 -> 공유`로 이동
- `bulk-upload / OCR / reboot / customize`를 메인 동선에서 후순위화
- pricing/guide/support 문구에서 `OCR·화면 녹화·PDF 전달` 중심 표현을 줄임
- 가이드 문구를 `이름 + 대표 후기 + 작업 사진 + 상담 버튼` 중심으로 축소

대표 반영 파일:

- `/Users/bin/Documents/for bin/record/app/dashboard/page.tsx`
- `/Users/bin/Documents/for bin/record/app/dashboard/profile/page.tsx`
- `/Users/bin/Documents/for bin/record/app/dashboard/share/page.tsx`
- `/Users/bin/Documents/for bin/record/app/pricing/page.tsx`
- `/Users/bin/Documents/for bin/record/app/guide/page.tsx`
- `/Users/bin/Documents/for bin/record/app/support/page.tsx`
- `/Users/bin/Documents/for bin/record/components/landing/TargetAudienceLanding.tsx`

---

## 9. 현재 데이터 모델 핵심

### User

주요 필드:

- `name`
- `username`
- `bio`
- `website`
- `phone`
- `avatar`
- `portfolioImages`
- `isPublic`
- `profileViews`
- `plan`

현재 스키마에는 여전히 아래 확장 필드가 존재:

- `theme`
- `layout`
- `bgImage`
- `bgColor`
- `accentColor`
- `introVideo`
- `customCss`

관련 파일:
- `/Users/bin/Documents/for bin/record/prisma/schema.prisma`
- `/Users/bin/Documents/for bin/record/prisma/schema.dev.prisma`

### Review

핵심 필드:

- `platform`
- `business`
- `content`
- `author`
- `rating`
- `reviewDate`
- `isVerified`
- `originalUrl`
- `imageUrl`
- `verificationStatus`

이 모델 덕분에 `리뷰 원문 링크 + 리뷰 캡처 + 직접 후기` 조합이 가능하다.

---

## 10. 기술 구조

### 프레임워크

- Next.js 15.5.12
- React 19
- TypeScript
- Tailwind CSS
- Prisma
- NextAuth

### DB 전략

- 개발: SQLite
- 프로덕션: PostgreSQL / Neon

### Prisma 이중 구조

- 프로덕션 스키마: `/Users/bin/Documents/for bin/record/prisma/schema.prisma`
- 개발 스키마: `/Users/bin/Documents/for bin/record/prisma/schema.dev.prisma`

이 구조는 dev에서 SQLite를 안정적으로 쓰고, prod에서는 Postgres를 쓰기 위해 분리되었다.

### 주요 스크립트

- `npm run dev`
- `npm run db:push:dev`
- `npm run seed:demo:dev`
- `npm run verify`
- `npm run smoke:local`
- `npm run preflight:prod`
- `npm run secrets:check`

관련 파일:
- `/Users/bin/Documents/for bin/record/package.json`

---

## 11. 검증 현황

2026-03-27 기준 로컬 검증 상태:

- `npm run verify` 통과
- `npm run smoke:local` 통과
- `npm run build` 통과

즉, 코드가 무너지는 상태는 아니다.

### 하지만 아직 프로덕션 런칭은 미완

`npm run preflight:prod` 결과:

- `DATABASE_URL` 없음
- `NEXTAUTH_SECRET` 없음
- `NEXTAUTH_URL` 없음
- 경고:
  - `NEXT_PUBLIC_URL`
  - `HEALTHCHECK_TOKEN`
  - OCR credential
  - payments env
  - email env

정리하면:

- 코드: 런칭 가능한 편
- 운영 env: 아직 미완

관련 문서:
- `/Users/bin/Documents/for bin/record/GLOBAL_LAUNCH_READINESS.md`
- `/Users/bin/Documents/for bin/record/PRODUCTION_OPERATOR_CHECKLIST.md`
- `/Users/bin/Documents/for bin/record/PRODUCTION_MIGRATION_BASELINE.md`

---

## 12. 지금 기준으로 가장 중요한 launch blocker

### 제품 blocker

아예 제품이 틀린 건 아니다.  
현재 blocker는 철학보다 `운영`이 더 크다.

### 운영 blocker

반드시 필요한 값:

- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_URL`
- `HEALTHCHECK_TOKEN`

결제까지 함께 열려면:

- `LEMONSQUEEZY_SIGNING_SECRET`
- Lemon checkout URLs

OCR은 지금 당장 필수 아님:

- 빠른 런칭이면 `ENABLE_OCR=false` 가능

email도 지금 당장 필수 아님:

- 빠른 런칭이면 `ENABLE_EMAIL=false` 가능

---

## 13. 지금 기준으로 꼭 지켜야 할 제품 원칙

### 런칭 때 절대 잊지 말 것

1. Re:cord는 `리뷰 통합 플랫폼`이 아니다.  
   Re:cord는 `상담 전에 보내는 신뢰 링크`다.

2. 홈의 주인공은 기능이 아니라 `결과물 한 장`이다.

3. 대시보드의 주인공은 관리 기능이 아니라 `공유 행동`이다.

4. 리뷰를 많이 넣는 것보다 `대표 후기 3개`가 중요하다.

5. OCR이 안 되어도 런칭 가능하다.

6. 공유가 안 되면 제품이 아니다.

7. 초기에는 버티컬을 넓히지 않는다.

8. 30초 안에 고객이 “누구인지 / 왜 믿는지 / 어디로 문의하는지”를 이해해야 한다.

---

## 14. 아직 정리되지 않은 것

이 문서는 현재 진실에 가깝지만, 아래는 여전히 업데이트가 덜 된 영역이다.

- `README.md`는 여전히 OCR/리뷰 SaaS 성격이 강함
- 일부 법률/개인정보/이용약관 문서에 OCR 중심 표현이 남아 있을 수 있음
- support / guide / pricing는 많이 정리했지만 완전한 최종 카피는 아님
- repo 내부에는 오래된 실험 파일/문서가 매우 많음

즉, 앞으로는 이 문서를 `현재 기준점`으로 삼고, 오래된 문서는 참고만 해야 한다.

---

## 15. 지금부터의 72시간 실행 순서

### Day 0

- 운영 env 최종 입력
- DB 연결 확인
- Lemon 결제 env 입력
- preview 재배포

### Day 1

- `/`
- `/signup`
- `/dashboard/profile`
- `/dashboard/share`
- `/stylist-demo`

위 5개만 집중 QA

### Day 2

- 실제 링크 공유 테스트
- 대표 후기/포트폴리오/CTA 읽힘 테스트
- 링크 복사/카카오/인스타 공유 테스트

### Day 3

- remote smoke
- 결제 redirect 확인
- webhook 확인
- production rollout

---

## 16. 최종 판단

2026-03-27 기준으로 Re:cord는:

- 방향성: 맞다
- MVP 정의: 꽤 선명하다
- 핵심 사용자 흐름: 살아 있다
- 코드 검증 상태: 양호하다
- 운영 준비: 아직 끝나지 않았다

따라서 현재 가장 정확한 문장은 이거다.

`Re:cord는 지금 출시 불가능한 제품이 아니라, 운영값만 채우면 출시 가능한 상태에 가까운 제품이다.`

단, 런칭 후에도 잊지 말아야 한다.

`이 서비스의 승부처는 OCR이 아니라, 실제로 사람들이 링크를 공유하고 그 링크가 상담 전 신뢰를 만드는가이다.`

---

## 17. 다음에 이 문서를 읽는 사람에게

이 프로젝트를 이어받는다면, 가장 먼저 아래를 확인하면 된다.

1. `/Users/bin/Documents/for bin/record/app/HomePageClient.tsx`
2. `/Users/bin/Documents/for bin/record/app/[username]/ProfileClient.tsx`
3. `/Users/bin/Documents/for bin/record/app/dashboard/page.tsx`
4. `/Users/bin/Documents/for bin/record/app/dashboard/profile/page.tsx`
5. `/Users/bin/Documents/for bin/record/app/dashboard/share/page.tsx`
6. `/Users/bin/Documents/for bin/record/prisma/schema.prisma`
7. `/Users/bin/Documents/for bin/record/package.json`
8. `/Users/bin/Documents/for bin/record/GLOBAL_LAUNCH_READINESS.md`
9. `/Users/bin/Documents/for bin/record/PRODUCTION_OPERATOR_CHECKLIST.md`

이 9개를 보면 현재 제품의 핵심 방향과 런칭 준비 상태를 가장 빠르게 이해할 수 있다.
