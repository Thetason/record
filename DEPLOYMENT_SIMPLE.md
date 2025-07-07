# 🚀 Re:cord 간단 배포 가이드

**옵션 1**: 통합 SQL 사용 (권장)

## 1. Supabase 설정 ⚡

### 1.1 새 프로젝트 생성
1. [Supabase](https://supabase.com) 로그인
2. **New Project** 클릭
3. 정보 입력:
   - **Name**: `record-portfolio`
   - **Password**: 안전한 비밀번호
   - **Region**: `Northeast Asia (Seoul)`
4. **Create new project** 클릭

### 1.2 데이터베이스 설정
1. **SQL Editor** 탭으로 이동
2. **New Query** 클릭
3. `supabase/migrations/001_production_schema.sql` 파일 내용 전체 복사
4. **Run** 버튼 클릭

### 1.3 인증 설정
1. **Authentication** > **Settings**
2. **Site URL**: 
   - Local: `http://localhost:3000`
   - Production: `https://your-domain.vercel.app`
3. **Redirect URLs**:
   - `http://localhost:3000/dashboard`
   - `https://your-domain.vercel.app/dashboard`

### 1.4 API 키 복사
**Settings** > **API** 탭에서:
- **Project URL** 복사
- **anon public** 키 복사

---

## 2. Vercel 배포 🌐

### 2.1 GitHub 연결
```bash
git add .
git commit -m "feat: prepare for deployment"
git push origin main
```

### 2.2 Vercel 설정
1. [Vercel](https://vercel.com) 로그인
2. **New Project** > GitHub 저장소 선택
3. **Import** 클릭

### 2.3 환경 변수 설정
**Environment Variables** 탭에서:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | [복사한 Project URL] |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | [복사한 anon key] |

### 2.4 배포 실행
**Deploy** 버튼 클릭!

---

## 3. 배포 확인 ✅

배포 완료 후 확인사항:

- [ ] 메인 페이지 로딩
- [ ] 회원가입 기능
- [ ] 로그인 기능  
- [ ] 프로필 생성
- [ ] 리뷰 추가
- [ ] 공개 프로필 페이지 (`/username`)

---

## 🎉 완료!

이제 Re:cord 서비스가 인터넷에 배포되었습니다!

**배포 URL**: `https://your-project-name.vercel.app`

### 다음 단계:
1. 커스텀 도메인 설정 (선택사항)
2. 첫 번째 사용자 등록 테스트
3. [사용자 가이드](./USER_GUIDE.md) 공유

### 문제 해결:
- **빌드 오류**: [전체 체크리스트](./CHECKLIST.md) 확인
- **환경 변수 오류**: Vercel 설정 재확인
- **인증 오류**: Supabase URL 설정 확인

---

**🚀 성공적인 배포를 축하합니다!**