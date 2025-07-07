# Re:cord - 프리랜서 리뷰 포트폴리오 서비스 🚀

<div align="center">

![Re:cord Logo](https://via.placeholder.com/200x80/FF6B35/FFFFFF?text=Re:cord)

**여러 플랫폼의 리뷰를 한 곳에 모아 멋진 포트폴리오를 만들어보세요!**

[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green?logo=supabase)](https://supabase.com/)

[**🌐 라이브 데모**](https://record.kr) | [**📚 사용자 가이드**](./USER_GUIDE.md) | [**🚀 배포 가이드**](./DEPLOYMENT.md)

</div>

---

## 📖 목차

- [소개](#📝-소개)
- [주요 기능](#🌟-주요-기능)
- [기술 스택](#🛠-기술-스택)
- [빠른 시작](#🚀-빠른-시작)
- [프로젝트 구조](#📁-프로젝트-구조)
- [배포하기](#🚀-배포하기)
- [기여하기](#🤝-기여하기)
- [라이선스](#📄-라이선스)

---

## 📝 소개

**Re:cord**는 프리랜서와 개인 사업자를 위한 올인원 리뷰 포트폴리오 서비스입니다. 

### 🎯 해결하는 문제
- ❌ 플랫폼별로 흩어진 리뷰 관리의 어려움
- ❌ 포트폴리오 웹사이트 제작 비용 부담
- ❌ 신뢰성 있는 고객 후기 공유의 복잡함

### ✅ Re:cord의 솔루션
- ✨ **통합 관리**: 6개 주요 플랫폼 리뷰를 한 곳에서 관리
- ✨ **무료 포트폴리오**: `record.kr/username` 형태의 공개 프로필
- ✨ **간편한 공유**: 링크 하나로 모든 리뷰를 공유

---

## 🌟 주요 기능

### 🔗 **통합 리뷰 관리**
- 네이버, 카카오, 구글, 크몽, 숨고, 당근마켓 리뷰 지원
- 플랫폼별 배지와 아이콘으로 구분
- 드래그 앤 드롭으로 순서 변경

### 👤 **개인 프로필 페이지**
- `record.kr/username` 형태의 고유 URL
- 반응형 디자인으로 모든 기기에서 최적화
- SEO 최적화로 검색 노출 향상

### 🎨 **사용자 친화적 인터페이스**
- Notion + Linear 스타일의 모던한 디자인
- 직관적인 드래그 앤 드롭 인터페이스
- 실시간 미리보기 기능

### 🔒 **강력한 보안**
- Supabase의 Row Level Security (RLS) 적용
- 사용자별 데이터 완전 격리
- JWT 기반 안전한 인증

---

## 🛠 기술 스택

### **Frontend**
- **Framework**: Next.js 15.3.5 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI + Custom Components
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React

### **Backend**
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes
- **ORM**: Supabase SDK

### **Deployment**
- **Hosting**: Vercel
- **Database**: Supabase Cloud
- **CDN**: Vercel Edge Network
- **Domain**: Custom domain support

### **Development**
- **Package Manager**: npm
- **Code Quality**: ESLint + Prettier
- **Type Checking**: TypeScript
- **Build Tool**: Next.js built-in

---

## 🚀 빠른 시작

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/record.git
cd record
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음을 추가:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. 개발 서버 실행

```bash
npm run dev
```

🎉 http://localhost:3000 에서 확인하세요!

### 5. 빌드 및 배포

```bash
npm run build
npm start
```

---

## 📁 프로젝트 구조

```
record/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 인증 관련 페이지
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/                # 대시보드 페이지
│   │   ├── add-review/
│   │   ├── edit-review/[id]/
│   │   └── reviews/
│   ├── [username]/               # 공개 프로필 페이지
│   ├── globals.css               # 글로벌 스타일
│   └── layout.tsx                # 루트 레이아웃
├── components/                   # 재사용 가능한 컴포넌트
│   ├── ui/                       # 기본 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── ...
│   ├── layout/                   # 레이아웃 컴포넌트
│   │   ├── Header.tsx
│   │   └── Container.tsx
│   └── ReviewForm.tsx            # 리뷰 폼 컴포넌트
├── lib/                          # 유틸리티 및 라이브러리
│   ├── supabase.ts               # Supabase 클라이언트
│   ├── api.ts                    # API 함수들
│   ├── auth-context.tsx          # 인증 컨텍스트
│   ├── toast.tsx                 # 토스트 알림
│   └── utils.ts                  # 유틸리티 함수
├── types/                        # TypeScript 타입 정의
│   └── database.ts
├── supabase/                     # Supabase 설정
│   └── migrations/               # 데이터베이스 마이그레이션
├── public/                       # 정적 파일
├── docs/                         # 문서
│   ├── DEPLOYMENT.md             # 배포 가이드
│   ├── USER_GUIDE.md             # 사용자 가이드
│   └── CHECKLIST.md              # 배포 체크리스트
├── tailwind.config.js            # Tailwind CSS 설정
├── vercel.json                   # Vercel 배포 설정
└── README.md                     # 프로젝트 문서
```

---

## 🎨 디자인 시스템

### 컬러 팔레트
- **Primary**: #FF6B35 (생동감 있는 오렌지)
- **Secondary**: #FF8CC8 (부드러운 핑크)
- **Background**: #FAFAFA (밝은 회색)
- **Foreground**: #2D3748 (진한 회색)

### 컴포넌트
- **Button**: 5가지 변형 (primary, secondary, outline, ghost, destructive)
- **Card**: 깔끔한 그림자와 둥근 모서리
- **Input**: 포커스 상태와 에러 표시
- **Badge**: 플랫폼별 색상 구분

### 지원 플랫폼
- **네이버** (#03C75A) - 대한민국 최대 검색포털
- **카카오** (#FEE500) - 모바일 메신저 및 서비스
- **구글** (#4285F4) - 글로벌 검색 및 비즈니스
- **크몽** (#FFD400) - 국내 최대 프리랜서 플랫폼
- **숨고** (#00C7AE) - 전문가 매칭 서비스
- **당근마켓** (#FF6F0F) - 지역 기반 중고거래

---

## 🗄️ 데이터베이스 스키마

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  profession TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Reviews Table
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  reviewer_name TEXT NOT NULL,
  review_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  source TEXT NOT NULL,
  image_url TEXT,
  external_link TEXT,
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🚀 배포하기

### Vercel (권장)

1. **GitHub 저장소 연결**
   ```bash
   git push origin main
   ```

2. **Vercel에서 Import**
   - [Vercel](https://vercel.com)에서 GitHub 저장소 import
   - 환경 변수 설정
   - 자동 배포 완료

3. **Supabase 설정**
   - [상세 배포 가이드](./DEPLOYMENT.md) 참조

### 배포 체크리스트
- [ ] [배포 체크리스트](./CHECKLIST.md) 모든 항목 확인
- [ ] 환경 변수 설정 완료
- [ ] Supabase 데이터베이스 마이그레이션 실행
- [ ] 도메인 및 SSL 설정

---

## 🧪 테스트

### 개발 환경 테스트
```bash
npm run dev
```

### 프로덕션 빌드 테스트
```bash
npm run build
npm start
```

### 타입 체크
```bash
npm run type-check
```

### 린트 검사
```bash
npm run lint
```

---

## 📈 성능 최적화

### 이미 적용된 최적화
- ✅ **코드 스플리팅**: Next.js의 자동 코드 분할
- ✅ **이미지 최적화**: Next.js Image 컴포넌트 사용
- ✅ **번들 최적화**: Tree shaking 및 압축
- ✅ **캐싱**: Vercel의 Edge 캐싱

### 추가 최적화 계획
- 🔄 **ISR**: 정적 재생성으로 성능 향상
- 🔄 **CDN**: 이미지 및 정적 파일 CDN 적용
- 🔄 **PWA**: 프로그레시브 웹 앱 기능 추가

---

## 🤝 기여하기

### 개발 환경 설정
1. Fork 후 클론
2. 새 브랜치 생성: `git checkout -b feature/new-feature`
3. 변경사항 커밋: `git commit -m 'Add new feature'`
4. 브랜치에 푸시: `git push origin feature/new-feature`
5. Pull Request 생성

### 기여 가이드라인
- 🎯 **코드 스타일**: Prettier와 ESLint 설정 준수
- 📝 **커밋 메시지**: [Conventional Commits](https://conventionalcommits.org/) 스타일
- 🧪 **테스트**: 새 기능에 대한 테스트 작성
- 📚 **문서**: README 및 관련 문서 업데이트

### 이슈 및 제안
- 🐛 **버그 리포트**: GitHub Issues 사용
- 💡 **기능 제안**: Discussion 탭 활용
- 📞 **질문**: GitHub Discussions 또는 이메일

---

## 📋 로드맵

### ✅ 완료된 기능
- [x] 기본 인증 시스템
- [x] 프로필 관리
- [x] 리뷰 CRUD 기능
- [x] 드래그 앤 드롭 순서 변경
- [x] 공개 프로필 페이지
- [x] 반응형 디자인
- [x] 플랫폼별 배지 시스템
- [x] 토스트 알림 시스템
- [x] 리뷰 검색 및 필터링

### 🔄 계획된 기능
- [ ] 이미지 업로드 시스템 (Supabase Storage)
- [ ] PWA 기능 추가
- [ ] SEO 최적화
- [ ] 리뷰 통계 대시보드
- [ ] 소셜 미디어 공유 최적화
- [ ] 다국어 지원 (영어)
- [ ] 리뷰 위젯 생성기
- [ ] API 문서 및 개방
- [ ] 모바일 앱 개발

---

## 🔧 문제 해결

### 자주 발생하는 문제

#### 빌드 오류
```bash
# 캐시 정리
rm -rf .next node_modules
npm install
npm run build
```

#### 환경 변수 오류
- `.env.local` 파일 존재 확인
- Supabase URL과 키 재확인
- 브라우저 새로고침

#### 인증 문제
- Supabase 프로젝트 설정 확인
- Site URL 및 Redirect URL 설정 확인

### 도움말 리소스
- 📚 [Next.js 문서](https://nextjs.org/docs)
- 🗄️ [Supabase 문서](https://supabase.com/docs)
- 🎨 [Tailwind CSS 문서](https://tailwindcss.com/docs)

---

## 📄 라이선스

이 프로젝트는 **MIT 라이선스** 하에 배포됩니다. 자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.

---

## 🙏 감사 인사

### 오픈소스 라이브러리
- [Next.js](https://nextjs.org/) - React 프레임워크
- [Supabase](https://supabase.com/) - 백엔드 서비스
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크
- [Radix UI](https://www.radix-ui.com/) - 접근성 높은 UI 컴포넌트
- [Lucide](https://lucide.dev/) - 아이콘 라이브러리

### 영감을 준 서비스
- [Linktree](https://linktr.ee/) - 링크 통합 서비스
- [Notion](https://notion.so/) - 디자인 영감
- [Linear](https://linear.app/) - UI/UX 참고

---

<div align="center">

**🚀 Re:cord로 나만의 리뷰 포트폴리오를 만들어보세요!**

[**시작하기**](https://record.kr) | [**문서 보기**](./DEPLOYMENT.md) | [**사용자 가이드**](./USER_GUIDE.md)

Made with ❤️ by Re:cord Team

</div>Making a small change to force redeploy
