# 🚀 Re:cord 런칭 최종 체크리스트 (2025)

**런칭일**: 2025년 11월 7일
**마지막 체크**: 2025년 11월 6일 23:59

---

## ✅ 빌드 & 코드 품질

- [x] **프로덕션 빌드 성공** - `npm run build` 완료
- [x] **TypeScript 에러 없음**
- [x] **add-review 참조 제거** - bulk-upload로 통일
- [x] **모든 라우팅 정리** - 불필요한 페이지 제거 완료
- [x] **Middleware 보안 설정** - CORS, CSP, 인증 체크 완료

---

## 🔐 환경 변수 & 보안 (Vercel 대시보드에서 설정)

### 필수 환경 변수

#### NextAuth (인증)
- [ ] `NEXTAUTH_SECRET` - 32자 이상 랜덤 문자열
  - 생성: `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` - **프로덕션 도메인으로 변경 필수!**
  - 현재 로컬: `http://localhost:3001`
  - **변경 필요**: `https://recordyours.com` 또는 `https://record-rho.vercel.app`

#### 데이터베이스
- [ ] `DATABASE_URL` - PostgreSQL (Neon/Supabase)
  - 현재: `postgresql://neondb_owner:npg_JqSalBh97mAy@ep-little-forest-a144tjd5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
  - Prisma 마이그레이션 실행: `npx prisma db push`

#### OAuth 로그인
- [x] `GOOGLE_CLIENT_ID` - 설정됨
- [x] `GOOGLE_CLIENT_SECRET` - 설정됨
- [x] `KAKAO_CLIENT_ID` - 설정됨
- [x] `KAKAO_CLIENT_SECRET` - 설정됨
- [ ] **OAuth Redirect URI 등록 확인**
  - Google: `https://YOUR-DOMAIN.com/api/auth/callback/google`
  - Kakao: `https://YOUR-DOMAIN.com/api/auth/callback/kakao`

#### OCR (Google Vision API)
- [x] `GOOGLE_VISION_API_KEY` - Base64 인코딩된 서비스 계정 키 설정됨
- [ ] **OCR 테스트** - 이미지 업로드 및 텍스트 추출 확인

#### 결제 (LemonSqueezy)
- [x] `NEXT_PUBLIC_LEMONSQUEEZY_PREMIUM_URL` - 프리미엄 결제 URL
- [x] `NEXT_PUBLIC_LEMONSQUEEZY_PRO_URL` - 비즈니스 결제 URL
- [x] `LEMONSQUEEZY_SIGNING_SECRET` - 웹훅 시크릿
- [ ] **웹훅 URL 등록**
  - URL: `https://YOUR-DOMAIN.com/api/webhooks/lemonsqueezy`
  - LemonSqueezy 대시보드에서 등록 필요

#### 기타
- [ ] `NEXT_PUBLIC_APP_URL` - 프로덕션 도메인
- [ ] `CORS_ALLOWED_ORIGINS` - 허용할 도메인 목록

---

## 🗄️ 데이터베이스

- [ ] **Prisma 스키마 동기화**
  ```bash
  npx prisma db push
  ```
- [ ] **테스트 계정 생성 확인**
- [ ] **무료 플랜 제한 설정 확인** (50개 리뷰)
- [ ] **관리자 계정 생성**
  - Role: `super_admin`

---

## 🧪 기능 테스트 (프로덕션 환경에서)

### 인증
- [ ] 회원가입 (이메일/비밀번호)
- [ ] 로그인
- [ ] Google OAuth 로그인
- [ ] Kakao OAuth 로그인
- [ ] 비밀번호 재설정

### 리뷰 관리
- [ ] 리뷰 일괄 업로드 (CSV/Excel)
- [ ] 리뷰 OCR 업로드 (이미지)
- [ ] 리뷰 수동 입력
- [ ] 리뷰 수정
- [ ] 리뷰 삭제
- [ ] 리뷰 공개/비공개 설정

### 프로필
- [ ] 공개 프로필 조회 (`/:username`)
- [ ] 프로필 편집
- [ ] 프로필 커스터마이징
- [ ] 프로필 공유 기능

### 결제
- [ ] 프리미엄 플랜 결제
- [ ] 비즈니스 플랜 결제
- [ ] 웹훅 수신 및 플랜 업그레이드 확인
- [ ] 플랜별 리뷰 제한 동작 확인

### 관리자
- [ ] 관리자 센터 접근 (`/admin`)
- [ ] 사용자 관리
- [ ] 리뷰 검증
- [ ] 통계 조회

---

## 🔒 보안 체크

- [x] **Middleware 인증 보호** - /dashboard, /admin 경로
- [x] **CORS 설정** - 허용된 도메인만 접근
- [x] **CSP (Content Security Policy)** - XSS 방지
- [x] **SQL Injection 방지** - Prisma ORM 사용
- [x] **Rate Limiting** - API 과부하 방지
- [x] **보안 헤더** - X-Frame-Options, X-Content-Type-Options 등

---

## 🎨 UI/UX

- [x] **반응형 디자인** - 모바일, 태블릿, 데스크톱
- [x] **다크모드** (선택)
- [x] **로딩 상태** - Skeleton UI
- [x] **에러 바운더리** - 앱 크래시 방지
- [x] **온보딩 배너** - 신규 사용자 가이드

---

## 📊 SEO & 성능

- [x] **메타데이터** - title, description
- [ ] **OG 이미지** - 소셜 공유 시 썸네일
- [ ] **사이트맵** - `/sitemap.xml`
- [ ] **robots.txt** - `/robots.txt`
- [x] **이미지 최적화** - Next.js Image
- [x] **코드 스플리팅** - Dynamic imports

---

## 📱 모니터링 & 분석

- [ ] **Vercel Analytics** 연동
- [ ] **에러 트래킹** (Sentry 등)
- [ ] **사용자 피드백 채널** - support@record.kr

---

## 📢 런칭 준비

- [ ] **도메인 연결** - recordyours.com (또는 Vercel 기본 도메인)
- [ ] **SSL 인증서** - Vercel 자동 제공
- [ ] **환경 변수 최종 확인**
- [ ] **백업 계획** - 데이터베이스 백업
- [ ] **롤백 계획** - 긴급 상황 대응

---

## ⚠️ 발견된 이슈

### 🔴 High Priority
1. **NEXTAUTH_URL 변경 필요**
   - 현재: `http://localhost:3001`
   - 변경: `https://YOUR-PRODUCTION-DOMAIN.com`
   - 위치: Vercel 환경 변수

2. **OAuth Redirect URI 등록**
   - Google Console
   - Kakao Developers

3. **LemonSqueezy 웹훅 URL 등록**
   - `https://YOUR-DOMAIN.com/api/webhooks/lemonsqueezy`

### 🟡 Medium Priority
1. OG 이미지 생성 및 등록
2. 사이트맵 생성
3. 에러 트래킹 설정

---

## 🎯 런칭 후 24시간 내 체크

- [ ] 회원가입 정상 작동 확인
- [ ] 결제 테스트 (실제 결제)
- [ ] 에러 로그 모니터링
- [ ] 사용자 피드백 수집
- [ ] 데이터베이스 연결 안정성 확인

---

## 📝 연락처

- **개발자**: seoyeongbin
- **이메일**: support@record.kr
- **Vercel 프로젝트**: https://vercel.com/bins-projects-304b9405/record
- **프로덕션 URL**: https://recordyours.com 또는 https://record-rho.vercel.app

---

**마지막 업데이트**: 2025-11-06 23:59
**체크리스트 작성자**: Claude Code
