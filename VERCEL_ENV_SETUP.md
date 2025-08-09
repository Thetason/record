# Vercel 환경 변수 설정 가이드

## 📝 단계별 설정 방법

### 1단계: Vercel 대시보드 접속
1. https://vercel.com 접속
2. GitHub 계정으로 로그인
3. 프로젝트 목록에서 `record` 프로젝트 클릭

### 2단계: Settings 메뉴로 이동
1. 프로젝트 페이지 상단의 **Settings** 탭 클릭
2. 왼쪽 사이드바에서 **Environment Variables** 클릭

### 3단계: 환경 변수 추가

#### 1️⃣ NEXTAUTH_SECRET 추가
1. **Key** 필드에 입력: `NEXTAUTH_SECRET`
2. **Value** 생성 방법:
   - 터미널에서 실행: `openssl rand -base64 32`
   - 또는 이 값 사용: `kO8K3nX9vP2qR5tY7wA1bC4dF6gH8jL0mN2oQ4rS6uV8xZ0`
3. **Environment** 선택: Production, Preview, Development 모두 체크
4. **Add** 버튼 클릭

#### 2️⃣ NEXTAUTH_URL 추가
1. **Key** 필드에 입력: `NEXTAUTH_URL`
2. **Value** 필드에 입력: `https://record-h3opbsfsp-bins-projects-304b9405.vercel.app`
   - 또는 커스텀 도메인이 있다면: `https://your-domain.com`
3. **Environment** 선택: Production 체크
4. **Add** 버튼 클릭

#### 3️⃣ DATABASE_URL 추가

**옵션 A: 임시 SQLite 사용 (테스트용)**
1. **Key**: `DATABASE_URL`
2. **Value**: `file:./prisma/dev.db`
3. **Environment**: Production, Preview, Development 모두 체크
4. **Add** 버튼 클릭

**옵션 B: Supabase 사용 (추천)**
1. https://supabase.com 에서 무료 프로젝트 생성
2. Settings → Database → Connection string 복사
3. Vercel에서:
   - **Key**: `DATABASE_URL`
   - **Value**: Supabase에서 복사한 연결 문자열
   - 형식: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres`
4. **Add** 버튼 클릭

### 4단계: 재배포
1. 환경 변수 추가 완료 후
2. **Deployments** 탭으로 이동
3. 가장 최근 배포 옆의 **...** 메뉴 클릭
4. **Redeploy** 선택
5. **Redeploy** 버튼 클릭

## 🔍 환경 변수 확인 방법
1. Settings → Environment Variables
2. 추가한 변수들이 모두 표시되는지 확인
3. 값은 보안상 숨겨져 있음 (••••••로 표시)

## ⚠️ 주의사항
- 환경 변수 추가 후 반드시 재배포 필요
- NEXTAUTH_SECRET은 절대 공개하지 말 것
- Production과 Development 환경 변수를 구분해서 설정

## 🚨 문제 해결

### 여전히 오류가 발생한다면:
1. **Build Logs** 확인
   - Vercel 대시보드 → Functions 탭 → Logs
2. **환경 변수 오타 확인**
   - 특히 NEXTAUTH_URL의 https:// 포함 여부
3. **재배포 시도**
   - Settings → Git → Deploy Hooks 생성 후 실행

## 📱 빠른 설정 (복사용)

```
NEXTAUTH_SECRET=kO8K3nX9vP2qR5tY7wA1bC4dF6gH8jL0mN2oQ4rS6uV8xZ0
NEXTAUTH_URL=https://record-h3opbsfsp-bins-projects-304b9405.vercel.app
DATABASE_URL=file:./prisma/dev.db
```

이 값들을 하나씩 Vercel 환경 변수에 추가하세요!