# 🔧 Vercel 환경변수 설정 가이드

## ⚠️ 현재 문제
- 로컬에서는 로그인이 정상 작동
- Vercel 배포 환경에서 "Configuration" 에러 발생
- NextAuth가 제대로 초기화되지 않음

## 📋 필수 환경변수 설정

Vercel 대시보드에서 다음 환경변수를 설정해야 합니다:

### 1. Vercel 대시보드 접속
1. https://vercel.com 로그인
2. `record` 프로젝트 선택
3. Settings → Environment Variables

### 2. 필수 환경변수 추가

```bash
# NextAuth 필수 설정
NEXTAUTH_URL=https://record-fogzebb0j-bins-projects-304b9405.vercel.app
NEXTAUTH_SECRET=kO8K3nX9vP2qR5tY7wA1bC4dF6gH8jL0mN2oQ4rS6uV8xZ0

# 데이터베이스 (이미 설정되어 있을 것)
DATABASE_URL=[현재 값 유지]
```

### 3. OAuth 설정 (선택사항)
OAuth 로그인을 사용하려면 추가:

```bash
# Google OAuth (선택)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret

# Kakao OAuth (선택)
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-secret
```

## 🚀 설정 방법

1. **Vercel 대시보드에서 Environment Variables 페이지 열기**
2. **각 변수 추가:**
   - Key: `NEXTAUTH_URL`
   - Value: `https://record-fogzebb0j-bins-projects-304b9405.vercel.app`
   - Environment: Production, Preview, Development 모두 체크
   - Add 클릭

3. **NEXTAUTH_SECRET 추가:**
   - Key: `NEXTAUTH_SECRET`
   - Value: `kO8K3nX9vP2qR5tY7wA1bC4dF6gH8jL0mN2oQ4rS6uV8xZ0`
   - Sensitive 체크 (비밀번호이므로)
   - 모든 환경에 적용

4. **재배포:**
   - Deployments 탭으로 이동
   - 최신 배포 옆 ... 메뉴 클릭
   - Redeploy 선택
   - "Use existing Build Cache" 체크 해제
   - Redeploy 클릭

## ✅ 확인 사항

환경변수 설정 후 확인:
1. 재배포가 완료될 때까지 기다림 (1-2분)
2. https://record-fogzebb0j-bins-projects-304b9405.vercel.app/login 접속
3. 로그인 테스트

## 🔍 디버깅

만약 여전히 문제가 있다면:
1. Vercel 대시보드 → Functions 탭에서 로그 확인
2. 환경변수가 모든 환경(Production, Preview, Development)에 설정되었는지 확인
3. NEXTAUTH_URL이 실제 배포 URL과 일치하는지 확인

## 📌 중요 참고사항

- NEXTAUTH_URL은 배포된 URL과 정확히 일치해야 함
- NEXTAUTH_SECRET은 로컬과 동일한 값 사용
- OAuth는 선택사항 (없어도 일반 로그인 가능)