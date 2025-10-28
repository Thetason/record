# 🚀 Re:cord 프로덕션 출시 체크리스트

출시 날짜: 2025-01-10  
도메인: https://recordyours.com

---

## ✅ 1. 빌드 & 코드 품질

- [x] **프로덕션 빌드 성공** (`npm run build`)
  - 모든 페이지 정상 컴파일
  - TypeScript 에러 없음
  - 경고 메시지 확인 완료
  
- [x] **네비게이션 일관성**
  - 홈페이지: Re:cord 로고 + 메뉴 표시 ✅
  - /pricing: 네비게이션 추가 완료 ✅
  - /guide: 네비게이션 추가 완료 ✅
  
- [x] **UX 개선 사항 적용**
  - 로딩 상태 명확화 (스피너 + 진행률 + 설명 텍스트) ✅
  - 리뷰 업로드 실시간 검증 (필수 항목 체크) ✅
  - 에러 메시지 구체화 (사용자 가이드 포함) ✅
  
- [x] **고객 중심 언어 변경**
  - "OCR" → "자동 인식" / "AI 자동 인식" ✅
  - "스크린샷 업로드" → "이미지로 빠른 등록" ✅
  - 모든 기술 용어를 고객 혜택 언어로 변경 ✅

---

## ✅ 2. 환경 변수 설정

### 로컬 환경 (.env.local)
- [x] `DATABASE_URL` - Neon PostgreSQL 연결 ✅
- [x] `NEXTAUTH_SECRET` - NextAuth 인증 시크릿 ✅
- [x] `NEXTAUTH_URL` - 로컬 URL 설정 ✅
- [x] `GOOGLE_VISION_API_KEY` - OCR 기능 ✅
- [x] `NEXT_PUBLIC_URL` - 프로덕션 도메인 ✅

### Vercel 프로덕션 환경 (확인 필요)
- [ ] `DATABASE_URL` - Production 환경에 설정 확인
- [ ] `NEXTAUTH_SECRET` - Production 환경에 설정 확인
- [ ] `NEXTAUTH_URL` - `https://recordyours.com` 설정 확인
- [ ] `NEXT_PUBLIC_URL` - `https://recordyours.com` 설정 확인
- [ ] `GOOGLE_VISION_API_KEY` - Production 환경에 설정 확인
- [ ] `POLAR_ACCESS_TOKEN` - Polar.sh 결제 토큰 (optional)
- [ ] `POLAR_ORGANIZATION_ID` - Polar.sh 조직 ID (optional)
- [ ] `POLAR_PREMIUM_PRODUCT_ID` - 프리미엄 플랜 ID (optional)
- [ ] `POLAR_BUSINESS_PRODUCT_ID` - 비즈니스 플랜 ID (optional)

---

## ⚠️ 3. 데이터베이스 & 인프라

### Neon PostgreSQL
- [ ] 프로덕션 데이터베이스 연결 테스트
- [ ] Prisma 마이그레이션 상태 확인
- [ ] 데이터베이스 백업 정책 확인

### Vercel 배포
- [x] 도메인 연결 완료
  - `recordyours.com` ✅
  - `www.recordyours.com` ✅
  - SSL 인증서 자동 발급 완료 ✅
- [ ] 프로덕션 배포 브랜치 확인 (`main`)
- [ ] 빌드 로그 에러 없는지 확인

---

## 🔐 4. 인증 & 보안

- [ ] **NextAuth 설정**
  - NEXTAUTH_URL이 `https://recordyours.com`로 설정되었는지 확인
  - Google OAuth 콜백 URL에 프로덕션 도메인 추가
  - 쿠키 설정 (secure: true, sameSite: lax)
  
- [ ] **Google OAuth 설정**
  - Google Cloud Console에서 승인된 리다이렉트 URI 확인
  - `https://recordyours.com/api/auth/callback/google` 추가 여부
  
- [ ] **CORS 설정**
  - API 엔드포인트 CORS 정책 확인
  - 프로덕션 도메인만 허용하는지 확인

---

## 💳 5. 결제 시스템 (Polar.sh)

- [ ] **Polar.sh 계정 설정**
  - Organization ID 확인
  - 프리미엄 플랜 (₩9,900/월) Product ID 설정
  - 비즈니스 플랜 (₩19,900/월) Product ID 설정
  
- [ ] **Webhook 설정**
  - Polar.sh Webhook URL: `https://recordyours.com/api/webhooks/polar`
  - Webhook 이벤트 구독: `checkout.completed`, `subscription.updated`
  
- [ ] **결제 플로우 테스트**
  - 프리미엄 플랜 구매 → Polar Checkout → 결제 완료 → DB 업데이트
  - 비즈니스 플랜 구매 → Polar Checkout → 결제 완료 → DB 업데이트

---

## 🎨 6. 주요 기능 플로우 테스트

### 회원가입 & 로그인
- [ ] 이메일 회원가입 (`/signup`)
- [ ] Google OAuth 로그인
- [ ] 비밀번호 재설정 플로우
- [ ] 로그인 후 대시보드 리다이렉트

### 리뷰 관리
- [ ] **수동 리뷰 추가** (`/dashboard/add-review`)
  - 필수 항목 실시간 검증 작동
  - 로딩 상태 명확하게 표시
  - 성공/에러 메시지 적절하게 표시
  
- [ ] **이미지 자동 인식** (`/dashboard/bulk-upload`)
  - Google Vision API 작동 확인
  - 여러 이미지 동시 업로드
  - 진행률 표시 (처리 중... X%)
  - 에러 발생 시 구체적인 메시지 표시
  
- [ ] **리뷰 수정/삭제** (`/dashboard/reviews`)
  - 리뷰 편집 기능
  - 리뷰 삭제 기능
  
### 프로필 & 공개 페이지
- [ ] **프로필 커스터마이징** (`/dashboard/customize`)
  - 테마 변경
  - 브랜드 색상 변경
  - 워터마크 표시 (Free 플랜) / 제거 (Premium/Pro 플랜)
  
- [ ] **공개 프로필 페이지** (`/[username]`)
  - 리뷰 목록 표시
  - 플랫폼별 필터링
  - 반응형 디자인 확인
  - 페이지 로딩 속도 확인

### 플랜 & 결제
- [ ] **요금 안내 페이지** (`/pricing`)
  - 3가지 플랜 표시 (Free, Premium, Pro)
  - 월간/연간 토글 작동
  - "플랜 시작하기" 버튼 → Polar Checkout 이동
  
- [ ] **플랜 업그레이드**
  - Free → Premium 업그레이드
  - Premium → Pro 업그레이드
  - DB에서 plan 필드 업데이트 확인

### 리뷰 쿼터 시스템
- [ ] **Free 플랜 제한** (20개)
  - 20개 초과 시 업로드 차단
  - 업그레이드 안내 메시지 표시
  
- [ ] **Premium 플랜 제한** (100개)
  - 100개 초과 시 업로드 차단
  - Pro 플랜 업그레이드 안내
  
- [ ] **Pro 플랜 무제한**
  - reviewLimit: -1 확인
  - 무제한 업로드 가능

---

## 📊 7. 모니터링 & 분석

- [ ] **에러 모니터링**
  - Vercel Analytics 활성화
  - 에러 로그 확인 방법 정리
  
- [ ] **성능 모니터링**
  - Core Web Vitals 확인
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
  
- [ ] **사용자 분석**
  - Google Analytics 설치 (optional)
  - 주요 전환 이벤트 트래킹

---

## 📱 8. 반응형 & 브라우저 호환성

- [ ] **모바일 테스트**
  - iPhone (Safari)
  - Android (Chrome)
  - 네비게이션 메뉴 작동
  - 이미지 업로드 작동
  
- [ ] **데스크톱 테스트**
  - Chrome
  - Safari
  - Firefox
  - Edge
  
- [ ] **태블릿 테스트**
  - iPad (Safari)
  - Android 태블릿

---

## 📝 9. 콘텐츠 & SEO

- [ ] **메타 태그 설정**
  - 홈페이지 title, description
  - OG 이미지 설정
  - Twitter Card 설정
  
- [ ] **사이트맵 생성**
  - `sitemap.xml` 자동 생성 확인
  - Google Search Console 등록
  
- [ ] **robots.txt**
  - 크롤링 허용/차단 정책 확인

---

## 🛡️ 10. 법적 & 정책 문서

- [ ] **이용약관** (`/terms`)
  - 서비스 이용 조건
  - 플랜별 제한 사항 명시
  
- [ ] **개인정보 처리방침** (`/privacy`)
  - 수집 정보 명시
  - 제3자 제공 내역 (Google Vision API)
  - 데이터 보관 기간
  
- [ ] **환불 정책**
  - Polar.sh MoR 모델 환불 정책 명시
  - 고객 문의 채널 안내

---

## 🚨 11. 긴급 대응 준비

- [ ] **롤백 계획**
  - 이전 배포 버전으로 롤백 방법 숙지
  - Vercel Deployment 히스토리 확인
  
- [ ] **장애 대응**
  - 데이터베이스 장애 시 대응 방법
  - API 장애 시 대응 방법
  - 고객 문의 접수 채널 (support@record.kr)
  
- [ ] **백업**
  - 데이터베이스 자동 백업 설정 확인
  - 중요 파일 백업 (환경 변수, 설정 파일)

---

## 📣 12. 마케팅 & 런칭

- [ ] **소프트 런칭**
  - 소수 베타 테스터에게 먼저 공개
  - 피드백 수집 후 개선
  
- [ ] **공식 런칭**
  - 블로그 게시글 작성
  - SNS 홍보 (인스타그램, 카카오톡 채널 등)
  - 타겟 고객층에게 직접 홍보

---

## ✅ 최종 체크

출시 전 마지막으로 확인해야 할 사항:

1. [ ] `https://recordyours.com` 접속 확인
2. [ ] 회원가입 → 로그인 → 리뷰 추가 → 프로필 확인 (End-to-End 테스트)
3. [ ] 결제 플로우 실제 결제로 테스트 (소액)
4. [ ] 모든 환경 변수가 Vercel Production에 설정되었는지 확인
5. [ ] Google OAuth 콜백 URL에 `recordyours.com` 추가 확인
6. [ ] Polar.sh Webhook URL 설정 확인
7. [ ] 에러 로그 모니터링 대시보드 확인
8. [ ] 고객 문의 이메일 `support@record.kr` 작동 확인

---

## 🎉 출시 후 모니터링

출시 후 24시간 동안:
- [ ] 회원가입 수 모니터링
- [ ] 에러 로그 실시간 확인
- [ ] 결제 완료 건수 확인
- [ ] 페이지 로딩 속도 확인
- [ ] 고객 문의 응답

---

**현재 상태**: 

✅ **완료된 항목**:
- 빌드 성공
- 로컬 환경 변수 설정
- UX 개선 (로딩, 검증, 에러 메시지)
- 네비게이션 일관성
- 도메인 연결 (recordyours.com)

⚠️ **확인 필요**:
- Vercel 프로덕션 환경 변수
- Google OAuth 콜백 URL
- Polar.sh 설정
- 데이터베이스 마이그레이션
- End-to-End 기능 테스트
