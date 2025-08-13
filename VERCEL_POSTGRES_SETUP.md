# Vercel Postgres 설정 가이드

## 🚀 Vercel Postgres 설정 방법

### 방법 1: Vercel 대시보드에서 설정 (권장)

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard 접속
   - `record` 프로젝트 선택

2. **Storage 탭 클릭**
   - 프로젝트 상단 메뉴에서 `Storage` 클릭
   - 또는 https://vercel.com/bins-projects-304b9405/record/stores 직접 접속

3. **Create Database 클릭**
   - `Postgres` 선택
   - Database 이름: `record-db` 입력
   - Region: `Washington D.C. (iad1)` 선택 (무료 플랜)
   - `Create` 클릭

4. **자동 환경변수 설정**
   Vercel이 자동으로 다음 환경변수를 설정합니다:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL` 
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

### 방법 2: CLI로 설정

```bash
# 1. Storage 추가
vercel storage create

# 2. Postgres 선택
# 3. 이름 입력: record-db
# 4. 환경변수 자동 설정됨
```

## 📝 Prisma 설정 업데이트

### 1. schema.prisma 수정
```prisma
datasource db {
  provider = "postgresql"  // sqlite → postgresql
  url      = env("DATABASE_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING") // Vercel Postgres용
}
```

### 2. 환경변수 가져오기
```bash
vercel env pull .env.local
```

### 3. 마이그레이션 실행
```bash
# 로컬에서 테스트
npx prisma migrate dev --name init

# 프로덕션 배포
npx prisma migrate deploy
```

## 🎯 Vercel Postgres 무료 플랜 제한

- **Compute Time**: 60시간/월
- **Storage**: 256MB
- **데이터 전송**: 256MB/월
- **예상 수용량**: 
  - 유저: 1,000~2,000명
  - 리뷰: 5만~10만개

## 💡 팁

1. **Connection Pooling 사용**
   - Prisma는 자동으로 `POSTGRES_PRISMA_URL` 사용
   - 서버리스 환경에 최적화

2. **모니터링**
   - Vercel 대시보드 → Storage → Usage 확인
   - 무료 한도 도달 전 알림 설정

3. **업그레이드 시점**
   - Storage 200MB 도달 시
   - Compute 50시간 도달 시
   - Pro 플랜 ($15/월) 고려

## 🔧 문제 해결

### "남은 Compute Time 부족" 오류
- 매월 1일 리셋됨
- Pro 플랜 업그레이드 필요

### Connection 오류
```bash
# 환경변수 다시 가져오기
vercel env pull --yes

# Prisma 클라이언트 재생성
npx prisma generate
```

## 📊 현재 상태 확인

Vercel 대시보드에서 확인:
https://vercel.com/bins-projects-304b9405/record/stores

---

*최종 업데이트: 2025-08-13*