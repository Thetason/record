# ⚡ 긴급! Vercel Postgres 설정 (5분 소요)

## 🔴 **지금 바로 하셔야 할 작업**

### 1️⃣ **Vercel 대시보드에서 Postgres 추가 (2분)**

1. **이 링크 클릭**: https://vercel.com/bins-projects-304b9405/record/stores
   
2. **"Create Database" 클릭**
   
3. **다음 설정으로 생성**:
   - Database Type: **Postgres** 선택
   - Database Name: `record-db`
   - Region: **Washington D.C. (iad1)** (무료는 이것만 가능)
   - Environment: **All** (Production, Preview, Development 모두 체크)
   
4. **"Create" 클릭**

5. **자동으로 환경변수가 추가됨** ✅

### 2️⃣ **로컬에서 환경변수 가져오기 (1분)**

터미널에서 실행:
```bash
# 환경변수 다시 가져오기
vercel env pull .env.local --yes

# 확인
cat .env.local | grep POSTGRES
```

`POSTGRES_URL`이 보이면 성공!

### 3️⃣ **데이터베이스 마이그레이션 (2분)**

```bash
# Prisma 클라이언트 재생성
npx prisma generate

# 데이터베이스 초기화 (처음 한 번만)
npx prisma db push

# 또는 마이그레이션
npx prisma migrate deploy
```

### 4️⃣ **배포 (자동)**

```bash
git add .
git commit -m "feat: Vercel Postgres 연동"
git push
```

## ✅ **성공 확인 방법**

1. https://vercel.com/bins-projects-304b9405/record/stores 에서 
   - `record-db` 데이터베이스가 보이면 성공

2. 로컬에서 테스트:
```bash
npm run dev
# http://localhost:3000/signup 에서 회원가입 테스트
```

## ⚠️ **주의사항**

- **무료 플랜 제한**:
  - 60시간/월 컴퓨팅
  - 256MB 스토리지
  - 약 1,000~2,000명 유저 수용 가능

- **오류 발생 시**:
  ```bash
  # 환경변수 재설정
  vercel env pull --yes
  
  # Prisma 재생성
  npx prisma generate
  
  # 강제 푸시
  npx prisma db push --force-reset
  ```

## 📱 **바로 실행할 명령어 복사**

```bash
# 1. 환경변수 가져오기
vercel env pull .env.local --yes

# 2. Prisma 설정
npx prisma generate
npx prisma db push

# 3. 커밋 & 배포
git add . && git commit -m "feat: Vercel Postgres 연동" && git push
```

---

**🚨 중요**: Vercel 대시보드에서 Postgres를 먼저 생성하지 않으면 작동하지 않습니다!

링크: https://vercel.com/bins-projects-304b9405/record/stores