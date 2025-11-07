# 🚀 Re:cord 런칭 전 최종 테스트 가이드

**작성일**: 2025-11-06 23:15
**테스트 대상**: https://www.recordyours.com

---

## ✅ 자동 확인 완료 항목

### 인프라
- [x] 프로덕션 사이트 접근 가능 (HTTP 200)
- [x] SSL 인증서 정상
- [x] 보안 헤더 적용 (CSP, X-Frame-Options 등)
- [x] 데이터베이스 연결 정상 (`/api/health` 체크)

### 환경 변수
- [x] `NEXTAUTH_URL` = `https://www.recordyours.com`
- [x] `NEXT_PUBLIC_URL` = `https://recordyours.com`
- [x] `DATABASE_URL` - PostgreSQL (Neon) 연결됨
- [x] OAuth 클라이언트 ID/SECRET 설정됨
- [x] Google Vision API Key 설정됨
- [x] LemonSqueezy Secret 설정됨

### UI 확인
- [x] 회원가입 페이지에 카카오 로그인 버튼 존재

---

## ⚠️ 수동 확인 필요 (5분 소요)

### 🔴 1단계: Google OAuth Redirect URI 등록

**콘솔 접속**
```
https://console.cloud.google.com/apis/credentials?project=model-academy-429906-g1
```

**확인 절차:**
1. 왼쪽 메뉴: **사용자 인증 정보** 클릭
2. **OAuth 2.0 클라이언트 ID** 섹션에서 클라이언트 ID 클릭
3. **승인된 리디렉션 URI** 섹션 확인

**필요한 URI (2개):**
```
✅ https://recordyours.com/api/auth/callback/google
✅ https://www.recordyours.com/api/auth/callback/google
```

**없으면 추가:**
- "URI 추가" 버튼 클릭
- 위 2개 URI 입력
- "저장" 클릭

---

### 🔴 2단계: Kakao OAuth Redirect URI 등록

**콘솔 접속**
```
https://developers.kakao.com/console/app
```

**확인 절차:**
1. **내 애플리케이션** 메뉴
2. **Re:cord** 앱 선택
3. 왼쪽: **제품 설정** > **카카오 로그인**
4. **Redirect URI** 섹션 확인

**필요한 URI (2개):**
```
✅ https://recordyours.com/api/auth/callback/kakao
✅ https://www.recordyours.com/api/auth/callback/kakao
```

**없으면 추가:**
- "Redirect URI 등록" 버튼
- 위 2개 URI 입력
- "저장" 클릭

**추가 확인:**
- **활성화 설정** 탭: "카카오 로그인" 상태가 **ON**인지 확인
- **동의 항목**: 프로필 정보(닉네임, 사진), 이메일 설정 확인

---

### 🔴 3단계: LemonSqueezy 웹훅 등록

**콘솔 접속**
```
https://app.lemonsqueezy.com/settings/webhooks
```

**확인 절차:**
1. **Settings** > **Webhooks** 메뉴
2. 웹훅 URL 확인

**필요한 URL:**
```
✅ https://recordyours.com/api/webhooks/lemonsqueezy
```

**없으면 추가:**
- "Add endpoint" 또는 "Create Webhook" 버튼
- URL 입력: `https://recordyours.com/api/webhooks/lemonsqueezy`
- "Save" 클릭

**웹훅 이벤트 체크 (5개):**
```
✅ order_created
✅ subscription_created
✅ subscription_updated
✅ subscription_cancelled
✅ subscription_payment_success
```

**Signing Secret 확인:**
- 웹훅 설정에서 "Signing Secret" 복사
- Vercel 환경변수 `LEMONSQUEEZY_SIGNING_SECRET`와 일치하는지 확인

---

## 🧪 4단계: 실제 기능 테스트 (10분 소요)

### Test 1: 이메일 회원가입
```
URL: https://www.recordyours.com/signup

1. 새 이메일로 회원가입
2. 아이디, 비밀번호 입력
3. "회원가입" 클릭
4. ✅ 대시보드로 리다이렉션되면 성공
```

### Test 2: Google OAuth 로그인
```
URL: https://www.recordyours.com/login

1. "Google로 로그인" 버튼 클릭
2. Google 계정 선택
3. 권한 승인
4. ✅ 대시보드로 리다이렉션되면 성공

❌ 에러 발생 시:
- "redirect_uri_mismatch" 에러 → Redirect URI 미등록
- 1단계로 돌아가서 URI 등록
```

### Test 3: Kakao OAuth 로그인
```
URL: https://www.recordyours.com/login

1. "카카오로 로그인" 버튼 클릭
2. 카카오 로그인
3. 동의 항목 확인 및 동의
4. ✅ 대시보드로 리다이렉션되면 성공

❌ 에러 발생 시:
- "invalid redirect_uri" 에러 → Redirect URI 미등록
- 2단계로 돌아가서 URI 등록
```

### Test 4: 리뷰 일괄 업로드 (CSV/Excel)
```
URL: https://www.recordyours.com/dashboard/bulk-upload

1. 샘플 CSV 파일 업로드
   (플랫폼, 업체명, 내용, 작성자, 작성일 포함)
2. "업로드" 클릭
3. ✅ 업로드 성공 메시지
4. 대시보드에서 리뷰 표시 확인
```

### Test 5: OCR 리뷰 업로드 (이미지)
```
URL: https://www.recordyours.com/dashboard/bulk-upload

1. 리뷰 스크린샷 이미지 선택
2. 이미지 업로드
3. ✅ OCR 텍스트 추출 성공
4. 추출된 텍스트 수정 가능 확인
5. "저장" 클릭
```

### Test 6: 공개 프로필 조회
```
URL: https://www.recordyours.com/[username]

1. 자신의 username으로 프로필 접근
2. ✅ 리뷰 목록 표시 확인
3. 플랫폼 필터링 작동 확인
4. 공유 버튼 작동 확인
```

### Test 7: 결제 (테스트 모드 권장)
```
URL: https://www.recordyours.com/pricing

⚠️ 주의: 실제 결제가 될 수 있으므로 테스트 카드 사용!

1. "프리미엄 시작하기" 클릭
2. ✅ LemonSqueezy 결제 페이지로 이동 확인
3. 테스트 카드로 결제 (또는 취소)
4. 결제 완료 시 웹훅 수신 확인 (Vercel 로그)
5. 대시보드에서 플랜 업그레이드 확인
```

---

## 📊 테스트 결과 체크리스트

### OAuth 설정
- [ ] Google Redirect URI 등록 완료
- [ ] Kakao Redirect URI 등록 완료
- [ ] Google OAuth 로그인 테스트 성공
- [ ] Kakao OAuth 로그인 테스트 성공

### 리뷰 관리
- [ ] CSV/Excel 일괄 업로드 성공
- [ ] OCR 이미지 업로드 성공
- [ ] 대시보드에서 리뷰 표시 확인
- [ ] 공개 프로필에서 리뷰 조회 확인

### 결제
- [ ] LemonSqueezy 웹훅 URL 등록 완료
- [ ] 결제 페이지 접근 확인
- [ ] (선택) 테스트 결제 성공

---

## 🚨 에러 대응 가이드

### "redirect_uri_mismatch" (Google OAuth)
```
원인: Google Console에 Redirect URI 미등록
해결: 1단계로 돌아가서 URI 등록
```

### "invalid redirect_uri" (Kakao OAuth)
```
원인: Kakao Developers에 Redirect URI 미등록
해결: 2단계로 돌아가서 URI 등록
```

### OCR 실패
```
원인 1: Google Vision API Key 누락/만료
해결: Vercel 환경변수 확인

원인 2: API 할당량 초과
해결: Google Cloud Console에서 할당량 확인
```

### 웹훅 수신 실패
```
원인: LemonSqueezy에 웹훅 URL 미등록 또는 Signing Secret 불일치
해결: 3단계로 돌아가서 웹훅 설정 확인
```

---

## 📞 긴급 연락처

- **Google Cloud Console**: https://console.cloud.google.com/
- **Kakao Developers**: https://developers.kakao.com/
- **LemonSqueezy**: https://app.lemonsqueezy.com/
- **Vercel Dashboard**: https://vercel.com/bins-projects-304b9405/record
- **Neon Database**: https://console.neon.tech/

---

## ✅ 최종 확인

모든 테스트가 완료되면:

```bash
✅ OAuth 설정 완료
✅ 리뷰 업로드 테스트 성공
✅ 결제 시스템 확인
✅ 에러 없음

🚀 런칭 준비 완료!
```

---

**작성**: Claude Code
**마지막 업데이트**: 2025-11-06 23:15
