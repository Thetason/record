# 🚀 Re:cord 프로젝트 설정 가이드

## 📋 필수 사전 준비

### 1. Node.js & npm
- Node.js 18.17 이상 필요
- 확인: `node -v` 

### 2. Git
- 코드 버전 관리
- 확인: `git --version`

---

## 🔧 프로젝트 초기 설정

### Step 1: 저장소 클론 & 패키지 설치
```bash
# 저장소 클론
git clone [repository-url]
cd record

# 패키지 설치
npm install
```

### Step 2: 환경 변수 설정
```bash
# .env.example을 복사하여 .env.local 생성
cp .env.example .env.local

# .env.local 파일을 열어 실제 값 입력
```

---

## 🗄️ Supabase 설정

### 1. Supabase 프로젝트 생성
1. [Supabase](https://app.supabase.com) 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `record-db`
   - Database Password: 안전한 비밀번호 생성
   - Region: Northeast Asia (Seoul)

### 2. API 키 확인
1. Settings → API 메뉴 이동
2. 다음 값들 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Database URL 확인
1. Settings → Database 메뉴
2. Connection string → URI 복사 → `DATABASE_URL`

### 4. Prisma 마이그레이션
```bash
# 데이터베이스 스키마 생성
npx prisma migrate dev --name init

# Prisma Client 생성
npx prisma generate
```

---

## 🔍 Google Cloud Vision API 설정

### 1. Google Cloud 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성
3. 프로젝트 이름: `record-ocr`

### 2. Vision API 활성화
1. APIs & Services → Library
2. "Cloud Vision API" 검색
3. "Enable" 클릭

### 3. 서비스 계정 생성
1. APIs & Services → Credentials
2. "Create Credentials" → "Service Account"
3. 서비스 계정 정보:
   - Name: `record-vision`
   - Role: `Cloud Vision API User`

### 4. 키 파일 생성
1. 생성된 서비스 계정 클릭
2. "Keys" 탭 → "Add Key" → "Create new key"
3. JSON 형식 선택 → 다운로드
4. 다운로드한 파일을 프로젝트 루트에 저장:
   ```bash
   # 파일명 변경 (예시)
   mv ~/Downloads/record-ocr-xxxxx.json ./google-vision-key.json
   ```
5. `.gitignore`에 추가 확인:
   ```
   google-vision-key.json
   ```

### 5. 환경 변수 설정
```bash
# .env.local에 추가
GOOGLE_APPLICATION_CREDENTIALS=./google-vision-key.json
```

### 6. Vercel 배포용 설정 (선택사항)
JSON 파일 대신 환경 변수로 직접 설정:
1. JSON 파일 열어서 다음 값 복사:
   - `project_id` → `GOOGLE_VISION_PROJECT_ID`
   - `private_key` → `GOOGLE_VISION_PRIVATE_KEY`
   - `client_email` → `GOOGLE_VISION_CLIENT_EMAIL`

---

## 🔐 NextAuth 설정

### 1. Secret 생성
```bash
# 랜덤 시크릿 생성
openssl rand -base64 32

# 생성된 값을 .env.local에 추가
NEXTAUTH_SECRET=생성된_랜덤_문자열
```

### 2. URL 설정
```bash
# 개발 환경
NEXTAUTH_URL=http://localhost:3000

# 프로덕션 (예시)
NEXTAUTH_URL=https://record.kr
```

---

## 🚀 개발 서버 실행

### 1. 개발 모드 실행
```bash
npm run dev
```

### 2. 접속 확인
- 메인: http://localhost:3000
- 로그인: http://localhost:3000/login
- 대시보드: http://localhost:3000/dashboard

### 3. 테스트 계정 생성
1. `/signup` 페이지에서 회원가입
2. 이메일 인증 (Supabase 대시보드에서 확인)
3. 로그인 후 대시보드 접속

---

## 🐛 문제 해결

### Prisma 에러
```bash
# Prisma Client 재생성
npx prisma generate

# 스키마 동기화
npx prisma db push
```

### Supabase 연결 에러
- API 키 확인
- 프로젝트 URL 확인
- 네트워크 연결 상태 확인

### Google Vision API 에러
- API 활성화 여부 확인
- 서비스 계정 권한 확인
- 키 파일 경로 확인

---

## 📱 모바일 테스트

### 로컬 네트워크에서 테스트
```bash
# IP 주소 확인 (Mac)
ifconfig | grep "inet " | grep -v 127.0.0.1

# 개발 서버 실행
npm run dev

# 모바일에서 접속
http://YOUR_IP:3000
```

### 반응형 확인사항
- [ ] 랜딩 페이지 모바일 레이아웃
- [ ] 로그인/회원가입 폼
- [ ] 대시보드 사이드바 → 하단 네비게이션
- [ ] 대량 업로드 드래그 앤 드롭
- [ ] 버튼 터치 영역 (최소 44px)

---

## 🚢 배포 준비

### Vercel 배포
1. [Vercel](https://vercel.com) 가입
2. GitHub 연동
3. 프로젝트 Import
4. 환경 변수 설정 (Settings → Environment Variables)
5. Deploy

### 프로덕션 체크리스트
- [ ] 환경 변수 프로덕션 값으로 변경
- [ ] 데이터베이스 백업 설정
- [ ] 에러 모니터링 (Sentry)
- [ ] 분석 도구 (Google Analytics)
- [ ] SSL 인증서 확인

---

## 📞 지원

문제가 있으시면:
1. GitHub Issues에 등록
2. 에러 메시지와 함께 상세 설명
3. 환경 정보 (OS, Node 버전 등) 포함

---

*최종 업데이트: 2025.08.09*