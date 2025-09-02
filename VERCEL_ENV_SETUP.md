# 🔧 Vercel 환경변수 설정 가이드

## 필수 환경변수 (지금 당장 설정해야 함!)

Vercel 대시보드 → Settings → Environment Variables에서 다음 설정:

### 1. NextAuth 설정 (필수!)
```
NEXTAUTH_URL=https://record-rho.vercel.app
NEXTAUTH_SECRET=생성방법_아래_참조
```

**NEXTAUTH_SECRET 생성 방법:**
```bash
# 터미널에서 실행
openssl rand -base64 32
```
또는 온라인 생성기: https://generate-secret.vercel.app/32

### 2. 데이터베이스 (필수!)
```
DATABASE_URL=postgresql://[사용자]:[비밀번호]@[호스트]/[DB명]?sslmode=require
```

Neon 사용시:
1. https://neon.tech 접속
2. 프로젝트 생성
3. Connection String 복사

### 3. 이메일 (선택)
```
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@record.kr
```

Resend 가입: https://resend.com

### 4. OAuth (선택)
```
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx

KAKAO_CLIENT_ID=xxxxx
KAKAO_CLIENT_SECRET=xxxxx
```

## 설정 방법

1. Vercel 대시보드 접속
2. 프로젝트 선택
3. Settings 탭
4. Environment Variables 메뉴
5. 각 변수 추가:
   - Key: 변수명
   - Value: 값
   - Environment: Production 체크
6. Save 버튼 클릭

## 설정 후 재배포

환경변수 설정 후 반드시 재배포:
1. Deployments 탭
2. 최신 배포 옆 ⋮ 메뉴
3. Redeploy 클릭
4. "Use existing Build Cache" 체크 해제
5. Redeploy 클릭

## 테스트 방법

설정 완료 후:
1. https://record-rho.vercel.app/login 접속
2. 테스트 계정으로 로그인:
   - ID: testuser
   - PW: Testuser1234!

## 문제 해결

### 401 Unauthorized 에러
→ NEXTAUTH_SECRET이 설정되지 않음

### 세션 유지 안 됨
→ NEXTAUTH_URL이 실제 배포 URL과 다름

### 데이터베이스 연결 실패
→ DATABASE_URL 확인, SSL 설정 확인