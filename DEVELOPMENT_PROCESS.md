# 🚀 Re:cord 개발 프로세스 가이드

## 📋 개발 워크플로우

### 1. 로컬 개발
```bash
# 개발 서버 실행
npm run dev

# 빌드 테스트
npm run build
```

### 2. 커밋 및 배포
```bash
# 변경사항 확인
git status

# 모든 변경사항 스테이징
git add -A

# 커밋 (의미있는 메시지와 함께)
git commit -m "✨ 기능 추가: [기능 설명]"

# GitHub에 푸시 (Vercel 자동 배포 트리거)
git push origin main
```

## 🔧 빌드 오류 해결 체크리스트

### 1. 컴포넌트 누락 오류
```
Module not found: Can't resolve '@/components/ui/[component]'
```

**해결 방법:**
1. 컴포넌트 파일 생성
2. Git에 추가 확인: `git add components/ui/[component].tsx`
3. 커밋 및 푸시

### 2. TypeScript 경로 오류
**tsconfig.json 확인:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]  // src/* 아님 주의!
    }
  }
}
```

### 3. 환경 변수 오류
**.env.local 필수 변수:**
```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="[32자 이상 랜덤 문자열]"
NEXTAUTH_URL="http://localhost:3000"
```

## 🚀 Vercel 배포 프로세스

### 1. 자동 배포 (권장)
1. GitHub에 코드 푸시
2. Vercel이 자동으로 감지하고 배포 시작
3. 2-3분 후 배포 완료

### 2. 수동 재배포 (필요시)
1. Vercel 대시보드 → Deployments
2. 최신 배포 옆 ⋮ → Redeploy
3. **"Use existing Build Cache"** 체크 해제 ⚠️
4. Redeploy 클릭

### 3. Vercel 환경 변수 설정
**Settings → Environment Variables에서 추가:**
- `DATABASE_URL`: `file:./prisma/dev.db`
- `NEXTAUTH_SECRET`: 보안 키
- `NEXTAUTH_URL`: `https://[your-domain].vercel.app`

⚠️ **중요**: @ 기호 사용 금지, 직접 값 입력!

## 🐛 자주 발생하는 문제와 해결법

### 문제 1: Vercel이 오래된 커밋 사용
**증상:** Build 로그에 오래된 커밋 ID 표시

**해결:**
```bash
# 캐시 초기화 트리거
echo "// 캐시 초기화 - $(date)" >> cache-trigger.txt
git add . && git commit -m "🔧 캐시 초기화" && git push
```

### 문제 2: 빌드는 성공하는데 배포 실패
**해결:**
1. 환경 변수 확인
2. Root Directory 설정 확인 (비어있거나 `.` 이어야 함)
3. Framework Preset: Next.js 확인

### 문제 3: 로컬은 되는데 Vercel에서만 오류
**체크리스트:**
1. 모든 파일이 Git에 커밋되었는지 확인
   ```bash
   git status
   git ls-files | grep [파일명]
   ```
2. package.json의 의존성 확인
3. 대소문자 확인 (파일명, import 경로)

## 📝 커밋 메시지 컨벤션

```
✨ feat: 새로운 기능 추가
🐛 fix: 버그 수정
📚 docs: 문서 수정
🎨 style: 코드 포맷팅
♻️ refactor: 코드 리팩토링
✅ test: 테스트 추가
🔧 chore: 빌드 업무 수정
🚀 deploy: 배포 관련
```

## 🔄 일일 개발 루틴

1. **작업 시작**
   ```bash
   git pull origin main  # 최신 코드 동기화
   npm install          # 의존성 업데이트
   npm run dev          # 개발 서버 시작
   ```

2. **작업 중**
   - 기능 단위로 자주 커밋
   - 의미있는 커밋 메시지 작성
   - 빌드 테스트 수행

3. **작업 완료**
   ```bash
   npm run build        # 빌드 확인
   git add -A
   git commit -m "✨ [작업 내용]"
   git push origin main # Vercel 자동 배포
   ```

## 💡 Pro Tips

1. **빌드 전 항상 테스트**
   ```bash
   npm run build
   ```

2. **환경 변수 변경 시**
   - 로컬: `.env.local` 수정
   - Vercel: Dashboard에서 수정 후 재배포

3. **큰 변경사항은 단계별 커밋**
   - 한 번에 너무 많은 변경 X
   - 기능 단위로 나누어 커밋

4. **Vercel 배포 모니터링**
   - Deployments 탭에서 실시간 확인
   - Build Logs로 오류 디버깅

---

*이 문서는 Re:cord 프로젝트의 원활한 개발을 위해 작성되었습니다.*
*최종 업데이트: 2025-08-09*
