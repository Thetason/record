# 📱 소셜 로그인 설정 가이드

Re:cord에서 구글과 카카오 로그인을 사용하려면 각 플랫폼에서 OAuth 앱을 생성하고 키를 발급받아야 합니다.

## 🔐 환경 변수 설정

`.env.local` 파일에 다음 변수들을 추가하세요:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Kakao OAuth  
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
```

---

## 📘 구글 OAuth 설정

### 1. Google Cloud Console 접속
- [Google Cloud Console](https://console.cloud.google.com) 접속
- 새 프로젝트 생성 또는 기존 프로젝트 선택

### 2. OAuth 2.0 클라이언트 생성
1. **API 및 서비스** → **사용자 인증 정보**
2. **사용자 인증 정보 만들기** → **OAuth 클라이언트 ID**
3. 애플리케이션 유형: **웹 애플리케이션**
4. 설정:
   - 이름: `Re:cord`
   - 승인된 JavaScript 원본:
     - `http://localhost:3000`
     - `http://localhost:3001`
     - `https://your-domain.vercel.app`
   - 승인된 리디렉션 URI:
     - `http://localhost:3000/api/auth/callback/google`
     - `http://localhost:3001/api/auth/callback/google`
     - `https://your-domain.vercel.app/api/auth/callback/google`

### 3. 클라이언트 ID와 시크릿 복사
- 생성된 OAuth 2.0 클라이언트에서 ID와 시크릿을 복사
- `.env.local`에 추가

---

## 💛 카카오 OAuth 설정

### 1. Kakao Developers 접속
- [Kakao Developers](https://developers.kakao.com) 접속
- 로그인 후 **내 애플리케이션** 클릭

### 2. 애플리케이션 생성
1. **애플리케이션 추가하기** 클릭
2. 앱 정보 입력:
   - 앱 이름: `Re:cord`
   - 사업자명: 개인 또는 회사명
3. 저장

### 3. 카카오 로그인 설정
1. 생성된 앱 선택 → **카카오 로그인** 탭
2. **활성화 설정** ON
3. **Redirect URI 등록**:
   - `http://localhost:3000/api/auth/callback/kakao`
   - `http://localhost:3001/api/auth/callback/kakao`
   - `https://your-domain.vercel.app/api/auth/callback/kakao`

### 4. 앱 키 확인
1. **앱 키** 탭에서 확인:
   - **REST API 키**: KAKAO_CLIENT_ID로 사용
2. **보안** 탭에서:
   - **Client Secret 생성**: 생성 후 KAKAO_CLIENT_SECRET으로 사용
   - Client Secret 코드 상태: **사용함**으로 설정

### 5. 동의 항목 설정
1. **카카오 로그인** → **동의항목**
2. 필수 동의 항목:
   - 프로필 정보(닉네임/프로필 사진)
   - 카카오계정(이메일)

---

## ⚙️ Vercel 배포 시 설정

### 1. Vercel 환경 변수 추가
Vercel 대시보드 → Settings → Environment Variables에서 추가:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
```

### 2. NextAuth URL 설정
프로덕션 환경에서는 NEXTAUTH_URL을 실제 도메인으로 설정:

```
NEXTAUTH_URL=https://your-domain.vercel.app
```

---

## 🧪 테스트

### 로컬 테스트
1. 개발 서버 실행: `npm run dev`
2. http://localhost:3001/login 접속
3. 구글/카카오 로그인 버튼 클릭
4. 각 플랫폼에서 인증 진행
5. 성공 시 /dashboard로 리다이렉트

### 주의사항
- 최초 OAuth 로그인 시 자동으로 계정이 생성됩니다
- username은 이메일 주소 기반으로 자동 생성됩니다
- 동일 이메일로 여러 플랫폼 로그인 시 계정이 자동 연동됩니다

---

## 🔍 트러블슈팅

### "redirect_uri_mismatch" 오류
- OAuth 설정에서 Redirect URI가 정확히 일치하는지 확인
- 프로토콜(http/https), 포트 번호 확인

### "invalid_client" 오류  
- Client ID와 Secret이 올바른지 확인
- 환경 변수가 제대로 로드되는지 확인

### 카카오 로그인 실패
- Client Secret 사용 설정이 켜져 있는지 확인
- 동의 항목에서 이메일 수집이 설정되어 있는지 확인

---

## 📚 참고 문서
- [NextAuth.js Providers](https://next-auth.js.org/providers)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Kakao Login API](https://developers.kakao.com/docs/latest/ko/kakaologin/common)

---

*최종 업데이트: 2025-08-22*