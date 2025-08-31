# 🚀 Vercel 프로덕션 환경 설정 가이드

## ⚠️ 중요: Vercel 대시보드에서 환경변수 설정 필요!

Vercel 배포 URL: https://record-fte9ce9mc-bins-projects-304b9405.vercel.app/

## 1. Vercel 환경변수 설정하기

### 필수 환경변수 (Vercel 대시보드에서 설정)

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard
   - 프로젝트 선택 → Settings → Environment Variables

2. **다음 환경변수 추가:**

```bash
# NextAuth 설정 (필수!)
NEXTAUTH_URL=https://record-rho.vercel.app
NEXTAUTH_SECRET=your-production-secret-key-min-32-chars-long

# 데이터베이스 (PostgreSQL 권장)
DATABASE_URL=postgresql://user:password@host:port/database
DATABASE_URL_UNPOOLED=postgresql://user:password@host:port/database

# 이메일 (선택)
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 결제 (선택)
NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_실제키
TOSS_SECRET_KEY=live_sk_실제키
```

## 2. NEXTAUTH_SECRET 생성하기

터미널에서 실행:
```bash
openssl rand -base64 32
```

생성된 값을 NEXTAUTH_SECRET에 사용

## 3. 데이터베이스 설정

### 옵션 1: Vercel Postgres (권장)
1. Vercel 대시보드 → Storage → Create Database
2. Postgres 선택
3. 자동으로 환경변수 연결됨

### 옵션 2: Supabase
1. https://supabase.com 에서 프로젝트 생성
2. Settings → Database → Connection string 복사
3. DATABASE_URL에 설정

### 옵션 3: Neon
1. https://neon.tech 에서 프로젝트 생성
2. Connection string 복사
3. DATABASE_URL에 설정

## 4. 프로덕션 데이터베이스 초기화

```bash
# 로컬에서 실행
DATABASE_URL="your-production-database-url" npx prisma db push
DATABASE_URL="your-production-database-url" npx prisma db seed
```

## 5. 프로덕션 사용자 생성

```javascript
// scripts/create-prod-user.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createProdUser() {
  const hashedPassword = await bcrypt.hash('Syb20201234!', 10);
  
  await prisma.user.create({
    data: {
      email: 'syb2020@test.com',
      username: 'syb2020',
      password: hashedPassword,
      name: 'SYB',
      role: 'admin',
      plan: 'pro',
      reviewLimit: 100,
      avatar: 'S'
    }
  });
  
  console.log('✅ 프로덕션 사용자 생성 완료');
}

createProdUser();
```

## 6. 배포 확인

1. Vercel에서 재배포 트리거
   - Vercel 대시보드 → Deployments → Redeploy

2. 환경변수 확인
   - Functions 탭에서 환경변수 적용 확인

3. 로그 확인
   - Functions 탭 → Logs에서 오류 확인

## 🔴 현재 문제

**401 Unauthorized 오류 원인:**
- NEXTAUTH_URL이 설정되지 않음
- NEXTAUTH_SECRET이 설정되지 않음
- 프로덕션 데이터베이스가 연결되지 않음

## ✅ 해결 방법

1. **즉시 Vercel 대시보드에서 환경변수 설정**
2. **재배포 실행**
3. **5분 후 다시 테스트**

## 📝 체크리스트

- [ ] NEXTAUTH_URL 설정
- [ ] NEXTAUTH_SECRET 설정 (32자 이상)
- [ ] DATABASE_URL 설정
- [ ] 재배포 완료
- [ ] 프로덕션 사용자 생성

## 🆘 문제 해결

### 로그인이 안 될 때:
1. Vercel Functions 로그 확인
2. 환경변수 다시 확인
3. 데이터베이스 연결 테스트

### 데이터베이스 오류:
1. Prisma 스키마와 실제 DB 동기화
2. `npx prisma db push --force-reset` (주의: 데이터 삭제됨)

---

**중요: 로컬은 정상 작동하므로 Vercel 환경변수만 설정하면 해결됩니다!**