# Re:cord 배포 가이드

## Vercel 배포 설정

### 1. 필수 환경 변수

Vercel 대시보드에서 다음 환경 변수를 설정해야 합니다:

#### NextAuth 설정
- `NEXTAUTH_SECRET`: 보안 키 (최소 32자 이상의 랜덤 문자열)
  - 생성 방법: `openssl rand -base64 32`
- `NEXTAUTH_URL`: 배포된 앱의 URL
  - 예: `https://your-app-name.vercel.app`

#### 데이터베이스 설정
- `DATABASE_URL`: PostgreSQL 또는 Supabase 데이터베이스 URL
  - 형식: `postgresql://username:password@host:port/database?schema=public`

### 2. Vercel에서 환경 변수 설정 방법

1. Vercel 대시보드로 이동
2. 프로젝트 선택
3. Settings → Environment Variables
4. 다음 변수 추가:
   ```
   NEXTAUTH_SECRET=your-generated-secret-key
   NEXTAUTH_URL=https://your-app.vercel.app
   DATABASE_URL=your-database-url
   ```

### 3. 로컬 개발 환경

로컬 개발을 위해 `.env.local` 파일에 다음 설정:

```env
NEXTAUTH_SECRET=development-secret-key
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=file:./prisma/dev.db
```

### 4. 배포 체크리스트

- [ ] 환경 변수 설정 완료
- [ ] 데이터베이스 연결 확인
- [ ] NextAuth 설정 확인
- [ ] 빌드 오류 없음 확인

### 5. 트러블슈팅

#### "NEXTAUTH_URL" 오류
- Vercel 환경 변수에 NEXTAUTH_URL이 설정되어 있는지 확인
- URL이 올바른 형식인지 확인 (https:// 포함)

#### 데이터베이스 연결 오류
- DATABASE_URL이 올바르게 설정되어 있는지 확인
- 프로덕션 데이터베이스가 준비되어 있는지 확인

#### 빌드 실패
- `npm run build` 로컬에서 먼저 테스트
- 모든 의존성이 package.json에 포함되어 있는지 확인