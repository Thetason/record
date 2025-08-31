# 🎉 Re:cord 배포 완료 가이드

## 📅 작성일: 2025-08-31

## ✅ 완료된 설정

### 1. Vercel 환경변수 ✅
- **NEXTAUTH_URL**: `https://record-rho.vercel.app` ✅
- **NEXTAUTH_SECRET**: 설정 완료 ✅
- **DATABASE_URL**: Vercel Postgres 자동 연결 ✅

### 2. 데이터베이스 ✅
- **Vercel Postgres**: `delicate-honor-21` ✅
- **Region**: Washington D.C. (iad1) ✅
- **상태**: Connected ✅

### 3. 프로젝트 URL
- **프로덕션**: https://record-rho.vercel.app
- **GitHub**: https://github.com/Thetason/record

## 🔐 로그인 정보

### 관리자 계정
- **아이디**: `syb2020`
- **비밀번호**: `Syb20201234!`
- **권한**: Admin
- **플랜**: Pro

### 테스트 계정
- **아이디**: `testuser`
- **비밀번호**: `Test1234!`
- **권한**: User
- **플랜**: Free

## 🚀 재배포 방법

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard

2. **프로젝트 선택**
   - `record` 프로젝트 클릭

3. **Deployments 탭**
   - 상단 메뉴에서 Deployments 클릭

4. **재배포**
   - 최신 배포 옆 ••• 클릭
   - Redeploy 선택
   - "Use existing Build Cache?" 체크 해제
   - Redeploy 클릭

5. **대기**
   - 3-5분 소요
   - Building... → Ready 확인

## 🔍 문제 해결

### 로그인이 안 될 때
1. **환경변수 확인**
   - Settings → Environment Variables
   - NEXTAUTH_URL이 `https://record-rho.vercel.app`인지 확인

2. **로그 확인**
   - Settings → Functions → Logs
   - 에러 메시지 확인

3. **데이터베이스 확인**
   - Storage → delicate-honor-21
   - Status가 Available인지 확인

### 데이터베이스 초기화 필요시
```bash
# 로컬에서 실행
npm install
npx prisma generate
npx prisma db push
node scripts/init-users.js
```

## 📱 주요 페이지

- **홈**: https://record-rho.vercel.app
- **로그인**: https://record-rho.vercel.app/login
- **회원가입**: https://record-rho.vercel.app/signup
- **대시보드**: https://record-rho.vercel.app/dashboard (로그인 필요)
- **프로필**: https://record-rho.vercel.app/syb2020

## 🛠️ 로컬 개발

```bash
# 개발 서버 시작
npm run dev

# 포트 3001로 시작
PORT=3001 npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start
```

## 📊 현재 상태

| 항목 | 상태 | 비고 |
|------|------|------|
| Vercel 배포 | ✅ 완료 | https://record-rho.vercel.app |
| 환경변수 | ✅ 설정 완료 | NEXTAUTH_URL, SECRET, DATABASE |
| 데이터베이스 | ✅ 연결됨 | Vercel Postgres |
| 로그인 시스템 | ✅ 작동 | NextAuth.js |
| 관리자 계정 | ✅ 생성됨 | syb2020 |
| SSL 인증서 | ✅ 자동 | Vercel 제공 |

## 💡 팁

1. **환경변수 변경 시**
   - 변경 후 반드시 Redeploy 필요

2. **코드 수정 시**
   - Git push하면 자동 배포됨

3. **데이터베이스 백업**
   - Vercel Storage에서 자동 백업

4. **모니터링**
   - Vercel Analytics에서 트래픽 확인
   - Functions 탭에서 API 로그 확인

## 🎯 다음 단계

- [ ] 실제 이메일 서비스 연결 (SendGrid/SMTP)
- [ ] 실제 결제 서비스 연결 (TossPayments)
- [ ] 도메인 연결 (record.com 등)
- [ ] Google Analytics 추가
- [ ] SEO 최적화

---

**마지막 업데이트**: 2025-08-31 19:42 KST
**작성자**: Claude & SYB