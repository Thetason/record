# 🔄 롤백 가이드

## 현재 저장된 버전

### v2.0-ux-improved (최신)
- **태그명**: `v2.0-ux-improved`
- **저장 일시**: 2025-08-10
- **설명**: UX 대폭 개선 버전
  - 히어로 섹션 페인포인트 강화
  - 회원가입 페이지 친근한 UI
  - 타겟 고객 순환 애니메이션
  - 서치박스 스타일 타겟 디자인

### v1.0-stable
- **태그명**: `v1.0-stable`
- **저장 일시**: 2025-08-09
- **설명**: 카피라이팅 변경 전 안정적인 버전

## 롤백하는 방법

### 방법 1: 특정 버전으로 완전히 되돌리기
```bash
# v1.0-stable 버전으로 되돌리기
git checkout v1.0-stable

# 새 브랜치 만들어서 작업하기 (선택사항)
git checkout -b rollback-branch

# 또는 main 브랜치를 완전히 리셋 (주의!)
git checkout main
git reset --hard v1.0-stable
git push --force origin main
```

### 방법 2: 특정 파일만 되돌리기
```bash
# 특정 파일만 이전 버전으로
git checkout v1.0-stable -- app/page.tsx
git commit -m "🔄 메인 페이지 카피 롤백"
git push
```

### 방법 3: 변경사항 확인 후 선택적 되돌리기
```bash
# 현재와 v1.0-stable의 차이 보기
git diff v1.0-stable

# 특정 커밋만 되돌리기
git revert [커밋해시]
```

## Vercel에서 롤백하기

1. Vercel 대시보드 → Deployments
2. v1.0-stable 태그가 있는 배포 찾기
3. 오른쪽 ⋮ → "Instant Rollback" 클릭

## 백업된 주요 파일들

- `/app/page.tsx` - 메인 랜딩 페이지
- `/app/dashboard/page.tsx` - 대시보드
- `/app/signup/page.tsx` - 회원가입
- `/app/login/page.tsx` - 로그인

## 주의사항

⚠️ `git push --force`는 신중하게 사용하세요
⚠️ 롤백 전 현재 작업 내용 커밋 또는 스태시 필수
⚠️ 팀 작업 시 다른 사람과 상의 후 진행

## 빠른 명령어

### 현재 상태 임시 저장
```bash
git stash save "카피 테스트 백업"
```

### 롤백 후 다시 불러오기
```bash
git stash pop
```

---
*이 가이드는 언제든 이전 버전으로 돌아갈 수 있도록 작성되었습니다.*