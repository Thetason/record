# 🚨 프로덕션 최종 확인 체크리스트

**작성일**: 2025-11-06 23:07
**프로덕션 URL**: https://www.recordyours.com

---

## ✅ 완료된 항목

### 1. 인프라 & 환경
- [x] **프로덕션 빌드 성공** - 로컬에서 `npm run build` 성공
- [x] **Vercel 배포 완료** - 최근 배포 8시간 전, Ready 상태
- [x] **프로덕션 사이트 접근 가능** - HTTP 200 응답
- [x] **SSL 인증서** - HTTPS 정상 작동
- [x] **보안 헤더** - CSP, X-Frame-Options 등 설정됨

### 2. 환경 변수 (Vercel)
- [x] `NEXTAUTH_URL` = `https://www.recordyours.com` ✅
- [x] `NEXTAUTH_SECRET` - 설정됨
- [x] `DATABASE_URL` - PostgreSQL (Neon) 연결
- [x] `GOOGLE_CLIENT_ID` - 설정됨
- [x] `GOOGLE_CLIENT_SECRET` - 설정됨
- [x] `KAKAO_CLIENT_ID` - 설정됨
- [x] `KAKAO_CLIENT_SECRET` - 설정됨
- [x] `GOOGLE_VISION_API_KEY` - OCR용 설정됨
- [x] `LEMONSQUEEZY_SIGNING_SECRET` - 결제 웹훅용 설정됨
- [x] `NEXT_PUBLIC_URL` = `https://recordyours.com`

---

## ⚠️ 수동 확인 필요 (외부 서비스)

### 🔴 1. Google OAuth Redirect URI 등록

**확인 방법:**
1. Google Cloud Console 접속: https://console.cloud.google.com/
2. 프로젝트 선택: `model-academy-429906-g1`
3. **API 및 서비스** > **사용자 인증 정보**
4. OAuth 2.0 클라이언트 ID 클릭
5. **승인된 리디렉션 URI**에 다음이 있는지 확인:

```
✅ https://recordyours.com/api/auth/callback/google
✅ https://www.recordyours.com/api/auth/callback/google
```

**없으면 추가:**
- "URI 추가" 버튼 클릭
- 위 2개 URI 입력
- "저장" 클릭

---

### 🔴 2. Kakao OAuth Redirect URI 등록

**확인 방법:**
1. Kakao Developers 접속: https://developers.kakao.com/
2. **내 애플리케이션** 메뉴
3. **Re:cord** 앱 선택
4. 왼쪽 메뉴: **제품 설정** > **카카오 로그인**
5. **Redirect URI**에 다음이 있는지 확인:

```
✅ https://recordyours.com/api/auth/callback/kakao
✅ https://www.recordyours.com/api/auth/callback/kakao
```

**없으면 추가:**
- "Redirect URI 등록" 버튼
- 위 2개 URI 입력
- "저장" 클릭

**추가 확인:**
- **활성화 설정** 탭에서 "카카오 로그인" 상태가 **ON**인지 확인
- **동의 항목** 설정 확인:
  - 프로필 정보 (닉네임, 프로필 사진) - 필수
  - 카카오계정 (이메일) - 선택 또는 필수

---

### 🔴 3. LemonSqueezy 웹훅 URL 등록

**확인 방법:**
1. LemonSqueezy Dashboard 접속: https://app.lemonsqueezy.com/
2. **Settings** > **Webhooks**
3. 다음 URL이 등록되어 있는지 확인:

```
✅ https://recordyours.com/api/webhooks/lemonsqueezy
```

**웹훅 이벤트 설정 확인:**
- ✅ `order_created` - 주문 생성 시
- ✅ `subscription_created` - 구독 시작 시
- ✅ `subscription_updated` - 구독 변경 시
- ✅ `subscription_cancelled` - 구독 취소 시
- ✅ `subscription_payment_success` - 결제 성공 시

**Signing Secret 확인:**
- 웹훅 설정에서 "Signing Secret" 복사
- Vercel 환경변수 `LEMONSQUEEZY_SIGNING_SECRET`와 일치하는지 확인

---

## 🧪 프로덕션 기능 테스트

### 1. 회원가입 & 로그인
- [ ] **이메일 회원가입** - https://www.recordyours.com/signup
  - 새 계정 생성 테스트
  - 이메일 중복 체크
  - 비밀번호 검증

- [ ] **이메일 로그인** - https://www.recordyours.com/login
  - 생성한 계정으로 로그인
  - 대시보드 리다이렉션 확인

- [ ] **Google OAuth 로그인**
  - "Google로 로그인" 버튼 클릭
  - Google 계정 선택
  - 권한 승인
  - 로그인 후 대시보드 이동 확인
  - **에러 발생 시**: OAuth Redirect URI 미등록

- [ ] **Kakao OAuth 로그인**
  - "카카오로 로그인" 버튼 클릭
  - 카카오 로그인
  - 동의 항목 확인
  - 로그인 후 대시보드 이동 확인
  - **에러 발생 시**: OAuth Redirect URI 미등록

### 2. 리뷰 업로드
- [ ] **일괄 업로드 (CSV/Excel)**
  - https://www.recordyours.com/dashboard/bulk-upload
  - 샘플 CSV 파일 업로드
  - 업로드 성공 확인
  - 대시보드에서 리뷰 표시 확인

- [ ] **OCR 업로드 (이미지)**
  - 리뷰 스크린샷 업로드
  - Google Vision API 텍스트 추출 확인
  - OCR 결과 수정 가능 확인

### 3. 프로필
- [ ] **공개 프로필 조회**
  - https://www.recordyours.com/[username]
  - 리뷰 목록 표시 확인
  - 플랫폼 필터링 작동 확인
  - 공유 기능 확인

- [ ] **프로필 편집**
  - 이름, 소개, 프로필 사진 변경
  - 저장 후 반영 확인

### 4. 결제 (테스트 모드)
- [ ] **프리미엄 플랜 결제**
  - https://www.recordyours.com/pricing
  - "프리미엄 시작하기" 클릭
  - LemonSqueezy 결제 페이지 이동 확인
  - **테스트 카드로 결제** (실제 결제 주의!)
  - 웹훅 수신 확인 (로그 체크)
  - 플랜 업그레이드 확인

- [ ] **비즈니스 플랜 결제**
  - 동일 절차

---

## 🔍 추가 확인 사항

### 데이터베이스
- [ ] Neon Dashboard에서 연결 상태 확인
- [ ] 최근 쿼리 로그 확인
- [ ] 테이블 데이터 확인

### Vercel Logs
- [ ] Vercel Dashboard > Logs 확인
- [ ] 에러 로그 없는지 확인
- [ ] API 응답 시간 확인

### 성능
- [ ] PageSpeed Insights 테스트
- [ ] Core Web Vitals 확인
- [ ] 모바일 반응형 확인

---

## 🚨 런칭 후 24시간 모니터링

- [ ] 시간대별 접속 확인
- [ ] 회원가입 수 체크
- [ ] 에러 로그 모니터링
- [ ] 데이터베이스 연결 안정성
- [ ] 결제 웹훅 수신 확인

---

## 📞 긴급 연락처

- **개발자**: seoyeongbin
- **이메일**: support@record.kr
- **Vercel 프로젝트**: https://vercel.com/bins-projects-304b9405/record
- **Neon DB**: https://console.neon.tech/
- **Google Cloud**: https://console.cloud.google.com/
- **Kakao Developers**: https://developers.kakao.com/
- **LemonSqueezy**: https://app.lemonsqueezy.com/

---

**마지막 업데이트**: 2025-11-06 23:07
