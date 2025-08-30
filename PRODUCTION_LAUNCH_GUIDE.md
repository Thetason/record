# 🚀 Re:cord 프로덕션 런칭 가이드

## 📅 D-3 런칭 체크리스트

### ✅ 완료된 작업
- [x] 기본 기능 구현 (로그인, 회원가입, 리뷰 관리)
- [x] 관리자 대시보드
- [x] 토스페이먼츠 결제 시스템 통합
- [x] 이메일 발송 시스템 구현
- [x] Google Vision API 설정 가이드
- [x] 프로덕션 데이터베이스 설정 가이드

### 🔴 필수 작업 (런칭 전 반드시 완료)

#### 1. Vercel 환경변수 설정
```bash
# Vercel 대시보드에서 설정할 환경변수

# 🔐 인증 (필수)
NEXTAUTH_SECRET=<openssl rand -base64 32로 생성>
NEXTAUTH_URL=https://your-domain.vercel.app

# 🗄️ 데이터베이스 (필수)
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://user:pass@host/db?sslmode=require

# 💳 결제 - 토스페이먼츠 (필수)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_... (테스트키 또는 실제키)
TOSS_SECRET_KEY=test_sk_... (테스트키 또는 실제키)

# 📧 이메일 발송 (필수 - 둘 중 하나 선택)
# SendGrid 사용 시
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@yourdomain.com

# 또는 Gmail SMTP 사용 시
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 🖼️ OCR (선택사항)
GOOGLE_VISION_API_KEY=<Base64 인코딩된 서비스 계정 키>
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

#### 2. 데이터베이스 설정

**옵션 A: Neon (추천)**
1. https://neon.tech 가입
2. 새 프로젝트 생성
3. Connection string 복사
4. Vercel 환경변수에 추가

**옵션 B: Supabase**
1. https://supabase.com 가입
2. 새 프로젝트 생성
3. Settings > Database에서 연결 정보 복사
4. Vercel 환경변수에 추가

#### 3. Prisma 스키마 수정
```javascript
// prisma/schema.prisma
datasource db {
  provider = "postgresql" // SQLite에서 변경
  url      = env("DATABASE_URL")
  directUrl = env("DATABASE_URL_UNPOOLED")
}
```

#### 4. 결제 시스템 활성화
1. https://developers.tosspayments.com 접속
2. 실제 API 키 발급
3. Vercel 환경변수에 추가

#### 5. 이메일 서비스 설정

**SendGrid 사용 시:**
1. https://sendgrid.com 가입
2. API Key 생성
3. Sender Verification 완료
4. 환경변수 설정

**Gmail SMTP 사용 시:**
1. Google 계정 2단계 인증 활성화
2. 앱 비밀번호 생성
3. 환경변수 설정

### 🚀 배포 프로세스

#### Step 1: 로컬 테스트
```bash
# 빌드 테스트
npm run build

# 프로덕션 모드 실행
npm run start
```

#### Step 2: Git 커밋
```bash
git add .
git commit -m "Production ready - launch preparation"
git push origin main
```

#### Step 3: Vercel 배포
```bash
# Vercel CLI 설치 (한 번만)
npm i -g vercel

# 배포
vercel --prod
```

또는 Vercel 대시보드에서:
1. Import Git Repository
2. 환경변수 설정
3. Deploy 클릭

### 📊 런칭 후 모니터링

#### 필수 확인 사항
- [ ] 회원가입 정상 작동
- [ ] 로그인 정상 작동
- [ ] 리뷰 업로드 정상 작동
- [ ] 결제 프로세스 테스트
- [ ] 이메일 발송 확인
- [ ] 데이터베이스 연결 상태
- [ ] 에러 로그 모니터링

#### Vercel Analytics
- Performance 모니터링
- Error tracking
- Usage analytics

### 🔥 긴급 대응 매뉴얼

#### 문제 발생 시:
1. Vercel 대시보드에서 로그 확인
2. 이전 버전으로 롤백 (필요시)
3. 환경변수 재확인
4. 데이터베이스 연결 상태 확인

#### 롤백 방법:
```bash
# Vercel 대시보드에서
Deployments → 이전 성공 배포 → Promote to Production
```

### 📞 지원 연락처
- Vercel Support: https://vercel.com/support
- Neon Support: https://neon.tech/support
- TossPayments: 1599-5479

### 🎯 런칭 타임라인

**D-2 (내일)**
- [ ] 모든 환경변수 설정 완료
- [ ] 데이터베이스 마이그레이션
- [ ] 스테이징 환경 테스트

**D-1 (모레)**
- [ ] 최종 QA 테스트
- [ ] 백업 준비
- [ ] 모니터링 도구 설정

**D-Day (런칭일)**
- [ ] 프로덕션 배포
- [ ] 실시간 모니터링
- [ ] 사용자 피드백 수집

---

## 🎉 런칭 준비 완료!

모든 설정이 완료되면 Re:cord가 실제 사용자를 맞이할 준비가 됩니다.
문제가 발생하면 즉시 롤백하고 수정 후 재배포하세요.

**화이팅! 🚀**