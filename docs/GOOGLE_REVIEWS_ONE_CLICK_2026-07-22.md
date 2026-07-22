# 구글 리뷰 "진짜 원클릭" 가져오기 — 실행 절차

기준 날짜: 2026-07-22
성격: AUTO_IMPORT_STRATEGY의 B경로(구글 공식 Business Profile API) 실행 문서.
다섯 플랫폼 중 구글만 유일하게 **사장님 OAuth 정식 승인 → 버튼 한 번에 전체 리뷰**가
합법적으로 가능하다. 캡처도, 사람도 필요 없다.

---

## 0. 먼저 솔직한 가치 판단

- 한국 레슨/뷰티 시장의 리뷰 본진은 네이버·카카오·당근이다. 구글 리뷰를 많이 가진
  타깃 고객은 소수(외국인 고객 받는 헤어샵, 글로벌 지향 강사 등).
- 그래도 할 가치: **"구글은 원클릭"이라는 사실 자체가 세일즈 문장**이 되고,
  구현 비용이 낮다(승인 대기만 길다). 신청은 무료, API 호출도 무료(쿼터제).
- 결론: 신청은 지금 걸어두고(3~14일 대기), 코드는 승인 떨어지면 하루면 붙인다.

## 1. 역할 분담

| 단계 | 누가 | 소요 |
|---|---|---|
| ① GCP 프로젝트 만들기 | **창업자** (구글 계정 필요) | 5분 |
| ② API 액세스 신청 폼 제출 | **창업자** (아래 초안 복붙) | 10분 |
| ③ 승인 대기 | 구글 | 3~14일 |
| ④ OAuth 동의화면 + 클라이언트 ID 생성 | **창업자** (가이드대로 클릭) | 10분 |
| ⑤ 환경변수 등록 (터미널) | **창업자** | 2분 |
| ⑥ 연동 코드 전체 (OAuth 라우트·리뷰 fetch·가져오기 UI) | **Claude** | 승인 후 즉시 |
| ⑦ 실계정 E2E 검증·배포 | **Claude** (+창업자 구글 로그인 1회) | 승인 후 즉시 |

계정 생성·로그인·키 발급은 정책상 창업자님이 직접 해야 합니다. 저는 그 전후 전부를 맡습니다.

## 2. 창업자 체크리스트 (순서대로)

### ① GCP 프로젝트
1. https://console.cloud.google.com → 새 프로젝트 → 이름 `record-reviews`
2. 프로젝트 선택 상태에서 "API 및 서비스" 화면까지 들어가지는지만 확인

### ② 신청 자격 확인 (중요 — 여기서 갈린다)
- **인증(verified)된 구글 비즈니스 프로필을 60일 이상 운영** 중이어야 신청 가능.
  세타쓴 보컬 스튜디오의 구글 비즈니스 프로필이 있고 인증돼 있으면 그걸 쓰면 된다.
  없다면: 지금 만들고 인증(엽서/전화)부터 — 이 경우 +60일 대기가 생기므로
  **프로필 생성만 먼저 해두는 게 이득**.
- 신청 이메일 도메인과 서비스 웹사이트가 이어져 보이는 게 유리
  (recordyours.com 도메인 메일이 있으면 그걸로, 없으면 폼에 서비스 URL을 명확히).

### ③ 액세스 신청 폼
- 주소: https://support.google.com/business/contact/api_default
- 드롭다운에서 **"Application for Basic API Access"** 선택
- 사용 사례 설명(영문 초안 — 그대로 붙여넣고 이름/이메일만 확인):

> Re:cord (recordyours.com) is a Korean SaaS that helps independent
> professionals (hair designers, vocal coaches, pilates instructors)
> present their verified customer reviews on a single public profile
> page. We request Basic API access to let business owners connect
> their own Google Business Profile via OAuth and import their own
> reviews (accounts.locations.reviews, read-only) into their Re:cord
> profile. Each owner authorizes access to only their own locations.
> Expected volume: fewer than 1,000 locations in the first year,
> read-only review fetches on user-initiated imports.

### ④ 승인 확인법
- GCP 콘솔 → API 및 서비스 → 할당량에서 Business Profile API 쿼터가
  **0 QPM → 300 QPM**으로 바뀌면 승인된 것. (거절도 메일로 옴)

### ⑤ 승인 후: OAuth 클라이언트 (제가 상세 가이드 다시 드림)
- OAuth 동의화면(외부) + 클라이언트 ID(웹) 생성,
  리디렉션 URI: `https://www.recordyours.com/api/google/callback`
- 터미널에서 (키는 채팅에 붙이지 말 것):

```bash
cd "/Users/bin/Documents/for bin/record"
npx vercel env add GOOGLE_OAUTH_CLIENT_ID production
npx vercel env add GOOGLE_OAUTH_CLIENT_SECRET production --sensitive
```

## 3. 승인 후 Claude가 만들 것 (설계 요약)

- `GET /api/google/connect` — 사장님을 구글 OAuth로 보냄
  (scope: `https://www.googleapis.com/auth/business.manage`, 읽기 용도로만 사용)
- `GET /api/google/callback` — 토큰 교환, 계정·위치 목록 조회
- `POST /api/google/import` — `accounts.locations.reviews` 전량 페이지네이션 →
  기존 `/api/reviews/import` 포맷으로 매핑 (platform: "구글",
  verifiedBy: "google_api", originalUrl: 리뷰 딥링크, 별점·날짜·작성자 그대로)
- 가져오기 페이지에 "구글 리뷰 원클릭 연결" 카드 (승인 전에는 숨김, env 존재 시 노출)
- 토큰은 저장하지 않고 세션 단위 사용(가져오기 1회성) — 보관 리스크 제거

## 4. 흔한 거절 사유 (피하기)

- 사용 사례가 모호함 → 위 초안처럼 "누가, 자기 소유 데이터를, OAuth로, 읽기 전용" 명시
- 웹사이트가 실제 동작하는 서비스로 안 보임 → recordyours.com은 라이브라 통과 요건 충족
- GBP 미인증/60일 미만 → ②에서 먼저 확인

---

참고 출처: [Google 공식 Prerequisites](https://developers.google.com/my-business/content/prereqs) ·
신청 폼(support.google.com/business/contact/api_default) · 승인 소요 3~14일(2026 실측 보고 다수)
