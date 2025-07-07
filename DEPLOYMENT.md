# Re:cord 배포 가이드 🚀

## 목차
1. [Supabase 설정](#1-supabase-설정)
2. [Vercel 배포](#2-vercel-배포)
3. [환경 변수 설정](#3-환경-변수-설정)
4. [배포 확인](#4-배포-확인)

---

## 1. Supabase 설정

### 1.1 새 프로젝트 생성
1. [Supabase](https://supabase.com) 접속 후 로그인
2. **New Project** 클릭
3. 프로젝트 정보 입력:
   - **Name**: `record-portfolio`
   - **Database Password**: 안전한 비밀번호 생성
   - **Region**: `Northeast Asia (Seoul)`
4. **Create new project** 클릭 (약 2분 소요)

### 1.2 데이터베이스 설정
1. 프로젝트 생성 후 **SQL Editor** 탭으로 이동
2. **New Query** 클릭
3. 아래 SQL 코드를 복사하여 실행:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL CHECK (length(username) >= 3 AND length(username) <= 50),
  name TEXT NOT NULL CHECK (length(name) >= 1 AND length(name) <= 100),
  bio TEXT CHECK (length(bio) <= 500),
  profession TEXT CHECK (length(profession) <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL CHECK (length(reviewer_name) >= 1 AND length(reviewer_name) <= 100),
  review_text TEXT NOT NULL CHECK (length(review_text) >= 10 AND length(review_text) <= 2000),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  source TEXT NOT NULL CHECK (source IN ('네이버', '카카오', '구글', '크몽', '숨고', '당근마켓')),
  image_url TEXT,
  external_link TEXT,
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_display_order ON public.reviews(user_id, display_order);
CREATE INDEX IF NOT EXISTS idx_reviews_visible ON public.reviews(user_id, is_visible);

-- Function to automatically update display_order
CREATE OR REPLACE FUNCTION update_display_order()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Set display_order to max + 1 for new reviews
    NEW.display_order = COALESCE(
      (SELECT MAX(display_order) + 1 FROM public.reviews WHERE user_id = NEW.user_id),
      1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto display_order
DROP TRIGGER IF EXISTS trigger_update_display_order ON public.reviews;
CREATE TRIGGER trigger_update_display_order
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_display_order();

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create views for public access
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  username,
  name,
  bio,
  profession,
  created_at
FROM public.profiles;

CREATE OR REPLACE VIEW public.public_reviews AS
SELECT 
  r.reviewer_name,
  r.review_text,
  r.rating,
  r.source,
  r.image_url,
  r.external_link,
  r.display_order,
  r.created_at,
  p.username
FROM public.reviews r
JOIN public.profiles p ON r.user_id = p.id
WHERE r.is_visible = true
ORDER BY p.username, r.display_order;

CREATE OR REPLACE VIEW public.review_stats AS
SELECT 
  p.username,
  COUNT(r.id) as total_reviews,
  COUNT(CASE WHEN r.is_visible THEN 1 END) as visible_reviews,
  ROUND(AVG(r.rating), 1) as average_rating,
  array_agg(DISTINCT r.source) as platforms
FROM public.profiles p
LEFT JOIN public.reviews r ON p.id = r.user_id
GROUP BY p.username, p.id;
```

4. **Run** 버튼 클릭하여 실행

### 1.3 RLS (Row Level Security) 정책 설정
다음 SQL을 실행하여 보안 정책을 활성화합니다:

```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Reviews policies
CREATE POLICY "Public reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Users can view their own reviews" ON public.reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);
```

### 1.4 인증 설정
1. **Authentication** > **Settings** 탭으로 이동
2. **Site URL** 설정:
   - Local: `http://localhost:3000`
   - Production: `https://your-domain.vercel.app`
3. **Redirect URLs** 추가:
   - `http://localhost:3000/dashboard`
   - `https://your-domain.vercel.app/dashboard`

---

## 2. Vercel 배포

### 2.1 GitHub 연결
1. 프로젝트를 GitHub 저장소에 푸시
2. [Vercel](https://vercel.com) 접속 후 로그인
3. **New Project** 클릭
4. GitHub 저장소 선택 후 **Import** 클릭

### 2.2 프로젝트 설정
1. **Project Name**: `record-portfolio`
2. **Framework Preset**: `Next.js`
3. **Root Directory**: `./` (기본값)
4. **Build Command**: `npm run build` (기본값)
5. **Output Directory**: `.next` (기본값)

---

## 3. 환경 변수 설정

### 3.1 Supabase 정보 확인
1. Supabase 프로젝트 대시보드에서 **Settings** > **API** 탭으로 이동
2. 다음 정보를 복사:
   - **Project URL**
   - **anon public** 키

### 3.2 Vercel 환경 변수 설정
Vercel 프로젝트 설정에서 **Environment Variables** 탭에 다음을 추가:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `your-project-url` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` | Production, Preview, Development |

### 3.3 로컬 개발 환경 설정
`.env.local` 파일을 생성하고 다음을 추가:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 4. 배포 확인

### 4.1 빌드 테스트
로컬에서 프로덕션 빌드 테스트:

```bash
npm run build
npm start
```

### 4.2 배포 후 확인사항
1. ✅ 메인 페이지 로딩 확인
2. ✅ 회원가입/로그인 기능 테스트
3. ✅ 프로필 생성 및 수정 테스트
4. ✅ 리뷰 추가/편집/삭제 테스트
5. ✅ 공개 프로필 페이지 확인 (`/username`)
6. ✅ 드래그 앤 드롭 순서 변경 테스트
7. ✅ 반응형 디자인 확인 (모바일/태블릿)

### 4.3 도메인 설정 (선택사항)
1. Vercel 프로젝트 **Settings** > **Domains** 탭
2. 커스텀 도메인 추가
3. DNS 설정 (A 레코드 또는 CNAME)
4. SSL 인증서 자동 발급 확인

---

## 🎉 배포 완료!

이제 Re:cord 서비스가 인터넷에 배포되었습니다!

### 다음 단계
1. 사용자 가이드 작성
2. SEO 최적화
3. 소셜 미디어 공유 기능 추가
4. 이미지 업로드 기능 구현

### 문제 해결
- **빌드 오류**: GitHub Actions 로그 확인
- **환경 변수 오류**: Vercel 환경 변수 재확인
- **데이터베이스 연결 오류**: Supabase URL/키 재확인
- **인증 오류**: Supabase 인증 설정의 URL 확인

---

**🚀 Happy Coding!**