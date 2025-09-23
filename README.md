# Re:cord - 리뷰 포트폴리오 플랫폼

<div align="center">
  <h1>Re:cord 📝</h1>
  <p><strong>리뷰는 누군가의 기억입니다</strong></p>
  <p>여러 플랫폼에 흩어진 리뷰를 한 곳에 모아 관리하는 통합 플랫폼</p>
</div>

## 🚀 주요 기능

- **📱 멀티 플랫폼 리뷰 통합**: 네이버, 카카오, 인스타그램 등 다양한 플랫폼 리뷰 수집
- **🔍 OCR 자동 인식**: Google Vision API를 활용한 리뷰 스크린샷 자동 텍스트 추출
- **📊 통계 대시보드**: 리뷰 현황과 성과를 한눈에 확인
- **🔗 공개 프로필**: 고객에게 보여줄 수 있는 전문적인 리뷰 포트폴리오
- **📈 비즈니스 성장**: 리뷰 통합으로 신뢰도 향상 및 매출 증대

## 🛠 기술 스택

- **Frontend**: Next.js 15.4, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (개발), PostgreSQL/Supabase (프로덕션)
- **Authentication**: NextAuth.js
- **OCR**: Google Cloud Vision API
- **Deployment**: Vercel

## 📦 설치 및 실행

### 필수 요구사항
- Node.js 18.0 이상
- npm 또는 yarn

### 설치
```bash
# 저장소 클론
git clone https://github.com/Thetason/record.git
cd record

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 필요한 환경 변수 설정

# 데이터베이스 초기화
npx prisma db push

# 개발 서버 실행
npm run dev
```

## 🔐 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google Vision API (선택)
GOOGLE_VISION_API_KEY="your-api-key"
```

## 📱 주요 페이지

- `/` - 랜딩 페이지
- `/login` - 로그인
- `/signup` - 회원가입
- `/dashboard` - 사용자 대시보드
- `/[username]` - 공개 프로필 페이지
- `/pricing` - 요금제 선택 및 결제 페이지 (실시간 플랜 데이터 연동)
- `/pricing/guide` - 요금제 기능 비교 및 결제/환불 정책 안내

## 🚀 배포

Vercel을 통한 자동 배포:
1. GitHub 저장소를 Vercel과 연결
2. 환경 변수 설정 (Vercel 대시보드)
3. 자동 빌드 및 배포

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md) 참조

## 📄 라이선스

이 프로젝트는 비공개 소프트웨어입니다. 무단 복제 및 배포를 금지합니다.

## 🤝 기여

이 프로젝트는 현재 비공개로 운영되고 있습니다.

## 📞 문의

- 이메일: [문의 이메일]
- 웹사이트: https://record-rho.vercel.app

---

<div align="center">
  <p>Made with ❤️ by Re:cord Team</p>
  <p>© 2024 Re:cord. All rights reserved.</p>
</div>
